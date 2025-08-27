import { Sandbox } from 'e2b';

/**
 * Extracts the scene class name from Manim code
 * @param code - The Python/Manim code as a string
 * @returns The first scene class name found, or null if none found
 */
export function extractSceneClassName(code: string): string | null {
  // Regular expression to match class definitions that inherit from Scene
  const sceneClassRegex = /class\s+(\w+)\s*\(\s*Scene\s*\):/g;
  
  const match = sceneClassRegex.exec(code);
  return match ? match[1] : null;
}

/**
 * Extracts all scene class names from Manim code
 * @param code - The Python/Manim code as a string
 * @returns Array of scene class names found
 */
export function extractAllSceneClassNames(code: string): string[] {
  const sceneClassRegex = /class\s+(\w+)\s*\(\s*Scene\s*\):/g;
  const classNames: string[] = [];
  let match;
  
  while ((match = sceneClassRegex.exec(code)) !== null) {
    classNames.push(match[1]);
  }
  
  return classNames;
}

/**
 * Test function to check if Manim is properly installed in the sandbox
 */
export async function testManimInstallation() {
  let sbx: Sandbox | null = null;
  
  try {
    sbx = await Sandbox.create('q6wznn8hq65ffgkd0tqh', {
      timeoutMs: 5 * 60 * 1000, // 5 minutes timeout
    });
    
    // Test basic commands
    const pythonVersionResult = await sbx.commands.run('python --version');
    const manimVersionResult = await sbx.commands.run('manim --version');
    const pipListResult = await sbx.commands.run('pip list | grep manim');
    
    return {
      success: true,
      tests: {
        python: {
          exitCode: pythonVersionResult.exitCode,
          output: pythonVersionResult.stdout || pythonVersionResult.stderr
        },
        manim: {
          exitCode: manimVersionResult.exitCode,
          output: manimVersionResult.stdout || manimVersionResult.stderr
        },
        packages: {
          exitCode: pipListResult.exitCode,
          output: pipListResult.stdout || pipListResult.stderr
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      tests: {}
    };
  } finally {
    if (sbx) {
      try {
        await sbx.kill();
      } catch (closeError) {
        console.warn('Error closing sandbox:', closeError);
      }
    }
  }
}

export async function executeCode(code: string) {
  let sbx: Sandbox | null = null;
  
  try {
    // Create sandbox with extended timeout (10 minutes for Manim rendering)
    sbx = await Sandbox.create('q6wznn8hq65ffgkd0tqh', {
      timeoutMs: 10 * 60 * 1000, // 10 minutes timeout
    });
    
    // Execute the user code by writing to a Python file and running it
    const filename = `manim_script_${Date.now()}.py`;
    await sbx.files.write(`/code/${filename}`, code);
    console.log('Code written to sandbox file system.');
    console.log(`Executing code in sandbox with filename: ${filename}`);
    
    // Extract scene class name for targeted rendering
    const sceneClassName = extractSceneClassName(code);
    // Use -qm (medium quality) instead of -pql (preview low quality) to get better videos
    // Removed -p flag to prevent preview popup and potential render issues
    const command = sceneClassName 
      ? `cd /code && manim -qm ${filename} ${sceneClassName}`
      : `cd /code && manim -qm ${filename}`;
    
    console.log(`Running command: ${command}`);
    const result = await sbx.commands.run(command);
    
    // Log detailed output for debugging
    console.log('Command result:', {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr
    });
    
    return {
      success: result.exitCode === 0,
      logs: [result.stdout, result.stderr].filter(Boolean),
      error: result.exitCode !== 0 ? result.stderr : null,
      results: []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      logs: [],
      results: []
    };
  } finally {
    // Clean up sandbox
    if (sbx) {
      try {
        await sbx.kill();
      } catch (closeError) {
        console.warn('Error closing sandbox:', closeError);
      }
    }
  }
}

export async function listSandboxFiles(path: string = '/code') {
  let sbx: Sandbox | null = null;
  
  try {
    // Create sandbox with extended timeout
    sbx = await Sandbox.create('q6wznn8hq65ffgkd0tqh', {
      timeoutMs: 5 * 60 * 1000, // 5 minutes timeout
    });
    
    const files = await sbx.files.list(path);
    
    return {
      success: true,
      files
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      files: []
    };
  } finally {
    // Clean up sandbox
    if (sbx) {
      try {
        await sbx.kill();
      } catch (closeError) {
        console.warn('Error closing sandbox:', closeError);
      }
    }
  }
}

export async function executeCodeAndListFiles(code: string) {
  let sbx: Sandbox | null = null;
  
  try {
    // Create sandbox with extended timeout for Manim operations
    sbx = await Sandbox.create('q6wznn8hq65ffgkd0tqh', {
      timeoutMs: 15 * 60 * 1000, // 15 minutes timeout for complex animations
    });
    
    // Execute the user code by writing to a Python file and running it
    const filename = `manim_script_${Date.now()}.py`;
    await sbx.files.write(`/code/${filename}`, code);
    console.log('Code written to sandbox file system.');
    console.log(`Executing code in sandbox with filename: ${filename}`);
    
    // Extract scene class name for targeted rendering
    const sceneClassName = extractSceneClassName(code);
    console.log(`Extracted scene class name: ${sceneClassName}`);
    // Use -qm (medium quality) instead of -pql (preview low quality) to get better videos
    // Removed -p flag to prevent preview popup and potential render issues
    const command = sceneClassName 
      ? `cd /code && manim -qm ${filename} ${sceneClassName}`
      : `cd /code && manim -qm ${filename}`;
    
    console.log(`Running command: ${command}`);
    // Run the Manim command to generate animations
    const result = await sbx.commands.run(command);
    console.log(`Manim command executed`);
    
    // List files after execution
    let files: any[] = [];
    let extractedVideos: { path: string, size: number }[] = [];
    
    try {
      // List files in /code directory
      files = await sbx.files.list('/code');
      
      // Find the media directory
      const mediaDir = files.find(file => file.name === 'media' && file.type === 'dir');
      if (mediaDir) {
        // List files in the media/videos directory
        const videosPath = '/code/media/videos';
        const videosDirContent = await sbx.files.list(videosPath);
        
        // Find the most recent video directory (they're named with timestamps)
        const videoDirectories = videosDirContent
          .filter(item => item.type === 'dir')
          .sort((a, b) => {
            const dateA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
            const dateB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
            return dateB - dateA;
          });
        
        if (videoDirectories.length > 0) {
          const recentVideoDir = videoDirectories[0];
          const qualityDirs = await sbx.files.list(`${videosPath}/${recentVideoDir.name}`);
          
          // Quality directories usually named like "480p15"
          for (const qualityDir of qualityDirs) {
            if (qualityDir.type === 'dir') {
              const videoFiles = await sbx.files.list(`${videosPath}/${recentVideoDir.name}/${qualityDir.name}`);
              
              // Find MP4 files
              const mp4Files = videoFiles.filter(file => 
                file.type === 'file' && 
                file.name.endsWith('.mp4') && 
                !file.name.includes('partial_movie_files')
              );
              
              // Download each video file
              for (const videoFile of mp4Files) {
                const videoFilePath = `${videosPath}/${recentVideoDir.name}/${qualityDir.name}/${videoFile.name}`;
                console.log(`Found video file: ${videoFilePath}`);
                
                try {
                  // Download the file content
                  const fileContent = await sbx.files.read(videoFilePath);
                  
                  // Save to local storage
                  const fs = require('fs');
                  const path = require('path');
                  
                  // Create directories if they don't exist
                  const localDir = path.join(process.cwd(), 'public', 'videos');
                  if (!fs.existsSync(localDir)) {
                    fs.mkdirSync(localDir, { recursive: true });
                  }
                  
                  const localFilePath = path.join(localDir, videoFile.name);
                  fs.writeFileSync(localFilePath, fileContent);
                  
                  console.log(`Saved video file locally to: /public/videos/${videoFile.name}`);
                  
                  // Add to the list of extracted files
                  extractedVideos.push({
                    path: videoFilePath,
                    size: fileContent.length
                  });
                } catch (downloadError) {
                  console.error(`Error downloading video file: ${videoFilePath}`, downloadError);
                }
              }
            }
          }
        }
      }
    } catch (fileError) {
      console.warn('Could not list or download files:', fileError);
    }
    
    return {
      success: result.exitCode === 0,
      execution: {
        logs: [result.stdout, result.stderr].filter(Boolean),
        error: result.exitCode !== 0 ? result.stderr : null,
        results: []
      },
      files,
      videoFiles: extractedVideos.map(vf => ({ 
        path: vf.path.replace('/code/', ''),
        size: vf.size
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      execution: {
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: []
      },
      files: [],
      videoFiles: []
    };
  } finally {
    // Clean up sandbox only after we've extracted all necessary files
    if (sbx) {
      try {
        await sbx.kill();
      } catch (closeError) {
        console.warn('Error closing sandbox:', closeError);
      }
    }
  }
}