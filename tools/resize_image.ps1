Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\a\Documents\Parkour\assets\resources\map\forest\bg_forest_bg.png"
$dstPath = "C:\Users\a\Documents\Parkour\assets\resources\map\forest\bg_forest_bg.png"
$backupPath = "C:\Users\a\Documents\Parkour\assets\resources\map\forest\bg_forest_bg_backup.png"

# Load original image
$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Original size: $($src.Width) x $($src.Height)"

# Backup original
Copy-Item $srcPath $backupPath -Force
Write-Host "Backup saved to: $backupPath"

$newWidth = 384
$newHeight = 320

# Create new bitmap with exact size
$dst = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
$graphics = [System.Drawing.Graphics]::FromImage($dst)

# Use NearestNeighbor for pixel art
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

# Draw resized image
$graphics.DrawImage($src, 0, 0, $newWidth, $newHeight)

# Dispose source before saving to same path
$src.Dispose()
$graphics.Dispose()

# Save
$dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()

Write-Host "Resized to: $newWidth x $newHeight"
Write-Host "Saved to: $dstPath"
