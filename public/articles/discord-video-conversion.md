@@Title: Converting Videos for Discord with Powershell
@@URL: discord-video-conversion
@@Date: 3/25/2024
@@TLDR: easily downsample to 9MB with ffmpeg after trimming with VLC
@@Tags: general
@@WordCount: 200
@@ReadEstimate: 5

# Video Editing

## Export for Discord

- Target File Size: ~9 MB

## Trim Video with [VLC](https://www.videolan.org/vlc/)

1. Open Video
2. View > Advanced Controls
3. Scrub to Start of Video and Push the **[🔴](https://emojipedia.org/large-red-circle) Record Button**
4. Watch Video
5. Pause near end
6. Use frame by frame at end
7. Push the **[🔴](https://emojipedia.org/large-red-circle) Record Button**
8. Video is exported to **Videos**

## Windows Setup - install ffmpeg with Powershell

```powershell
winget install "FFmpeg (Essentials Build)"
```

## Powershell Script

1. Place in **Videos Folder** as Convert-Video.ps1
2. Open Powershell

```powershell
cd Videos
./Convert-Video input.mp4
# file gets saved with filename_compressed.mp4
```

## Source Code

```powershell script
param (
    [string]$inputFile
)

# Extract the duration using ffmpeg and process the output
$ffmpegOutput = & ffmpeg -i $inputFile 2>&1
$durationLine = $ffmpegOutput | Select-String "Duration"
$durationString = $durationLine -replace "Duration: ", "" -replace ",.*$", ""
$durationParts = $durationString.Split(':')
$hours = [int]$durationParts[0]
$minutes = [int]$durationParts[1]
$seconds = [double]$durationParts[2]

$duration = $hours * 3600 + $minutes * 60 + $seconds

# Output the duration in seconds
$duration

# Define target file size in MB
$targetSizeMB = 9
# Convert MB to kilobits
$targetSizeKbits = $targetSizeMB * 8000
# Calculate bitrate
$bitrate = [Math]::Round($targetSizeKbits / $duration)

# Define the output file name
$outputFile = [System.IO.Path]::GetFileNameWithoutExtension($inputFile) + "_compressed.mp4"

# Execute ffmpeg to convert the video
& ffmpeg -i $inputFile -b:v "${bitrate}k" -bufsize "${bitrate}k" -maxrate "${bitrate}k" -an $outputFile

Write-Host "Conversion complete. File saved as $outputFile"
```

## How it Works

## Calculate bitrate for desired filesize

```math
bitrate = (8000×8) / seconds of video

bitrate = 64000 / seconds of video

Example: 7s video ≈ 9143 kbps
```

## Convert file

```powershell
ffmpeg -i input.mp4 -b:v 9143k -bufsize 9143k -maxrate 9143k -an output.mp4
```