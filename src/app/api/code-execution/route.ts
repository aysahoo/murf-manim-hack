import { NextRequest, NextResponse } from 'next/server'
import { executeCodeAndListFiles, listSandboxFiles } from '@/utils/sandbox'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const result = await executeCodeAndListFiles(body.code)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Code execution failed',
          details: result.execution.error 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      execution: result.execution,
      files: result.files
    })
    
  } catch (error) {
    console.error('Error in code execution endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    
    const result = await listSandboxFiles(path)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to list files',
          details: result.error 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files: result.files,
      path
    })
    
  } catch (error) {
    console.error('Error in file listing endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
