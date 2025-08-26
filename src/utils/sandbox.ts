import { Sandbox } from 'e2b'

export async function executeCode(code: string) {
  let sbx: Sandbox | null = null;
  try {
    // Create sandbox with extended timeout (10 minutes for Manim rendering)
    sbx = await Sandbox.create('q6wznn8hq65ffgkd0tqh', {
      timeoutMs: 10 * 60 * 1000, // 10 minutes timeout
    });
    
    // Execute the user code by writing to a Python file and running it
    const filename = `/code/manim_script_${Date.now()}.py`;
    await sbx.files.write(filename, code);
    
    const result = await sbx.commands.run(`cd /code && python3 ${filename}`);
    
    return {
      success: result.exitCode === 0,
      logs: [result.stdout],
      error: result.exitCode !== 0 ? result.stderr : null,
      results: []
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      logs: [],
      results: []
    }
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
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      files: []
    }
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
    const filename = `/code/manim_script_${Date.now()}.py`;
    await sbx.files.write(filename, code);
    
    // Run the Python script
    const result = await sbx.commands.run(`cd /code && python3 ${filename}`);
    
    // List files after execution
    let files: any[] = [];
    try {
      files = await sbx.files.list('/code');
    } catch (fileError) {
      console.warn('Could not list files:', fileError);
    }
    
    return {
      success: result.exitCode === 0,
      execution: {
        logs: [result.stdout, result.stderr].filter(Boolean),
        error: result.exitCode !== 0 ? result.stderr : null,
        results: []
      },
      files
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      execution: {
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: []
      },
      files: []
    }
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