<#
.SYNOPSIS
  Syncs public/images/gallery into data/gallery.json with optimised derivatives.
.DESCRIPTION
  - Scans public/images/gallery (recursively). Named subfolders become gallery
    categories; files at the root go into "All Photos".
  - Generates EXIF-free derivatives next to the originals (originals untouched):
      thumbs/<name>.jpg  (max width 800)   - grid
      large/<name>.jpg   (max width 1600)  - lightbox
  - Merges data/gallery.json by source file: preserves caption/alt/category/order
    set in Admin > Content > gallery, appends new files at the end (by name),
    drops entries whose files are gone.
  - Handles spaces and mixed-case extensions. Prints GPS-metadata warnings for
    originals (generated files never carry EXIF).
  - Order on the site = array order in gallery.json. Reorder there or in Admin.
  - NOTE: this file must stay pure ASCII (no smart quotes/dashes) so that
    Windows PowerShell 5.1 reads it correctly with or without a BOM.
USAGE
  powershell -ExecutionPolicy Bypass -File scripts/sync-gallery.ps1
#>
$ErrorActionPreference = "Stop"

$root = Join-Path (Get-Location) "public\images\gallery"
$thumbsDir = Join-Path $root "thumbs"
$largeDir = Join-Path $root "large"
$dataFile = Join-Path (Get-Location) "data\gallery.json"

if (-not (Test-Path $root)) { Write-Error "Folder not found: $root"; exit 1 }
New-Item -ItemType Directory -Force -Path $thumbsDir, $largeDir | Out-Null
Add-Type -AssemblyName System.Drawing

function Save-Resized($src, $dest, $maxW) {
  $img = [System.Drawing.Image]::FromFile($src)
  try {
    $w = $img.Width; $h = $img.Height
    if ($w -le $maxW) { $nw = $w; $nh = $h }
    else { $nw = $maxW; $nh = [int]([math]::Round($h * $maxW / $w)) }
    # Fresh bitmap => no EXIF/GPS is carried over, ever.
    $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.DrawImage($img, 0, 0, $nw, $nh)
      $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
      $par = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 82)
      $bmp.Save($dest, $enc, $par)
    } finally { $g.Dispose(); $bmp.Dispose() }
    return @{ width = $img.Width; height = $img.Height }
  } finally { $img.Dispose() }
}

# Previous entries keyed by source file, so captions/alts/order survive re-syncs.
$prev = @{}
if (Test-Path $dataFile) {
  foreach ($e in (Get-Content $dataFile -Raw | ConvertFrom-Json)) {
    if ($e.file) { $prev[$e.file] = $e }
  }
}

$exts = @(".jpg", ".jpeg", ".png", ".webp")
$files = Get-ChildItem -Path $root -Recurse -File |
  Where-Object { $exts -contains $_.Extension.ToLower() -and $_.DirectoryName -notlike "*\thumbs*" -and $_.DirectoryName -notlike "*\large*" } |
  Sort-Object { $_.FullName }

if ($files.Count -eq 0) { Write-Warning "No images found in $root"; exit 0 }

$items = @()
$order = 0
foreach ($f in $files) {
  $cwd = (Get-Location).Path
  $rel = $f.FullName.Substring($cwd.Length + 1).Replace("\", "/")
  $parentAbs = Split-Path $f.FullName -Parent
  $relDir = $parentAbs.Substring($root.Length).Trim("\", "/").Replace("\", "/")
  if ($relDir -eq "") { $category = "All Photos" } else { $category = ($relDir -split "/")[0] }
  $base = [IO.Path]::GetFileNameWithoutExtension($f.Name).Trim() -replace "[^a-zA-Z0-9]+", "-"
  $base = $base.Trim("-").ToLower()
  if (-not $base) { $base = "photo" }
  $id = "g-" + $base
  $thumbRel = "images/gallery/thumbs/$base.jpg"
  $largeRel = "images/gallery/large/$base.jpg"

  $thumbAbs = Join-Path (Get-Location) ("public\" + $thumbRel.Replace("/", "\"))
  $largeAbs = Join-Path (Get-Location) ("public\" + $largeRel.Replace("/", "\"))
  $regen = (-not (Test-Path $thumbAbs)) -or (-not (Test-Path $largeAbs)) -or ((Get-Item $thumbAbs).LastWriteTime -lt $f.LastWriteTime)
  if ($regen) {
    $dims = Save-Resized $f.FullName $thumbAbs 800
    Save-Resized $f.FullName $largeAbs 1600 | Out-Null
  } else {
    $probe = [System.Drawing.Image]::FromFile($f.FullName)
    $dims = @{ width = $probe.Width; height = $probe.Height }
    $probe.Dispose()
  }

  # GPS / location metadata check on the ORIGINAL (generated files are clean).
  $src2 = [System.Drawing.Image]::FromFile($f.FullName)
  $hasGps = $src2.PropertyIdList -contains 0x8825
  $src2.Dispose()
  if ($hasGps) {
    Write-Warning "ORIGINAL contains GPS location metadata: $rel . Web derivatives are EXIF-free, but consider stripping the original before sharing it."
  }

  $order = $order + 1
  if ($prev.ContainsKey($rel)) {
    $old = $prev[$rel]
    $useOrder = $order
    if ($null -ne $old.order) { $useOrder = $old.order }
    $rec = [ordered]@{
      id = $old.id; title = $old.title; category = $old.category
      image = "/" + $largeRel; thumb = "/" + $thumbRel
      caption = $old.caption; alt = $old.alt; file = $rel
      width = $dims.width; height = $dims.height; order = $useOrder
    }
    $items = $items + $rec
  } else {
    $rec = [ordered]@{
      id = $id; title = ""; category = $category
      image = "/" + $largeRel; thumb = "/" + $thumbRel
      caption = ""; alt = ""; file = $rel
      width = $dims.width; height = $dims.height; order = $order
    }
    $items = $items + $rec
    Write-Output "NEW: $rel"
  }
}

$items = @($items | Sort-Object { $_.order }, { $_.id })
$json = $items | ConvertTo-Json -Depth 5
# No-BOM UTF-8: a BOM breaks JSON.parse when Node reads gallery.json.
[IO.File]::WriteAllText($dataFile, $json, (New-Object Text.UTF8Encoding $false))
$cats = ($items.category | Sort-Object -Unique) -join ", "
Write-Output "Wrote $($items.Count) entries to data/gallery.json (categories: $cats)."
