Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\a\Documents\Parkour\assets\resources\map\forest\bg_forest_bg.png'
$backupPath = 'C:\Users\a\Documents\Parkour\assets\resources\map\forest\bg_forest_bg_edge_backup.png'

# Load from backup (clean version)
$img = [System.Drawing.Bitmap]::FromFile($backupPath)
$newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($newImg)
$g.DrawImage($img, 0, 0)
$g.Dispose()
$img.Dispose()

# 4행 4번째 타일 (0-indexed: row=3, col=3)
# X 시작: 3 * 64 = 192, X 끝: 255
# Y 시작: 3 * 64 = 192
$tileX = 255  # 우측 1픽셀
$tileY = 192
$tileHeight = 64

# 우측 1픽셀을 투명하게
for ($y = $tileY; $y -lt ($tileY + $tileHeight); $y++) {
    $newImg.SetPixel($tileX, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
}

# Save
$tempPath = $imgPath + '.tmp'
$newImg.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newImg.Dispose()

Remove-Item $imgPath -Force
Rename-Item $tempPath $imgPath
Write-Host 'Done: Cleared right 1px of tile at row 4, col 4 (x=255, y=192-255)'
