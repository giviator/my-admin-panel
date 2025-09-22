# Script for creating project map
$projectPath = "E:\VITE\TREA"
$outputFile = "E:\VITE\TREA\PROJECT_MAP.txt"

# Create file header
$header = @"
================================================================================
                            TREA PROJECT MAP
================================================================================
Creation date: $(Get-Date -Format "dd.MM.yyyy HH:mm:ss")
Project path: $projectPath

This file contains complete project map with all files and their content
(excluding node_modules folder)

================================================================================

"@

# Write header to file
$header | Out-File -FilePath $outputFile -Encoding UTF8

# Get all project files (excluding node_modules)
$files = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.Name -ne "PROJECT_MAP.txt" -and
    $_.Name -ne "create_project_map.ps1"
}

# Add information about file count
"TOTAL FILES COUNT: $($files.Count)" | Add-Content -Path $outputFile -Encoding UTF8
"" | Add-Content -Path $outputFile -Encoding UTF8

# Process each file
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($projectPath, "").TrimStart('\')
    
    # Add file separator
    "=" * 80 | Add-Content -Path $outputFile -Encoding UTF8
    "FILE: $($file.Name)" | Add-Content -Path $outputFile -Encoding UTF8
    "PATH: $relativePath" | Add-Content -Path $outputFile -Encoding UTF8
    "FULL PATH: $($file.FullName)" | Add-Content -Path $outputFile -Encoding UTF8
    "SIZE: $([math]::Round($file.Length / 1KB, 2)) KB" | Add-Content -Path $outputFile -Encoding UTF8
    "LAST MODIFIED: $($file.LastWriteTime.ToString('dd.MM.yyyy HH:mm:ss'))" | Add-Content -Path $outputFile -Encoding UTF8
    "=" * 80 | Add-Content -Path $outputFile -Encoding UTF8
    "" | Add-Content -Path $outputFile -Encoding UTF8
    
    # Check if this is a text file
    $textExtensions = @('.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.xml', '.yml', '.yaml', '.gitignore', '.env')
    $isBinaryFile = $false
    
    # Check file extension
    if ($file.Extension -in $textExtensions -or $file.Name -in @('.gitignore', 'LICENSE.md', 'README.md')) {
        try {
            # Read file content
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            
            if ($content) {
                "FILE CONTENT:" | Add-Content -Path $outputFile -Encoding UTF8
                "-" * 40 | Add-Content -Path $outputFile -Encoding UTF8
                $content | Add-Content -Path $outputFile -Encoding UTF8
            } else {
                "[EMPTY FILE]" | Add-Content -Path $outputFile -Encoding UTF8
            }
        }
        catch {
            "[ERROR READING FILE: $($_.Exception.Message)]" | Add-Content -Path $outputFile -Encoding UTF8
        }
    }
    elseif ($file.Extension -in @('.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico')) {
        "[IMAGE FILE - CONTENT NOT DISPLAYED]" | Add-Content -Path $outputFile -Encoding UTF8
    }
    else {
        "[BINARY FILE - CONTENT NOT DISPLAYED]" | Add-Content -Path $outputFile -Encoding UTF8
    }
    
    "" | Add-Content -Path $outputFile -Encoding UTF8
    "" | Add-Content -Path $outputFile -Encoding UTF8
}

# Add summary at the end
"=" * 80 | Add-Content -Path $outputFile -Encoding UTF8
"END OF PROJECT MAP" | Add-Content -Path $outputFile -Encoding UTF8
"Total files count: $($files.Count)" | Add-Content -Path $outputFile -Encoding UTF8
"Completion date: $(Get-Date -Format "dd.MM.yyyy HH:mm:ss")" | Add-Content -Path $outputFile -Encoding UTF8
"=" * 80 | Add-Content -Path $outputFile -Encoding UTF8

Write-Host "Project map created: $outputFile" -ForegroundColor Green
Write-Host "Files processed: $($files.Count)" -ForegroundColor Yellow