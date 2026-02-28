import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    
    if (!language || !['python', 'typescript'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language parameter' }, { status: 400 });
    }
    
    // Look for the pre-generated ZIP file in the public downloads directory
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    const todayDate = new Date().toISOString().split('T')[0];
    const fileName = `onenode-docs-${language}-${todayDate}.zip`;
    const filePath = path.join(downloadsDir, fileName);
    
    let zipBuffer;
    
    try {
      // Try to read the pre-generated file
      zipBuffer = await fs.readFile(filePath);
    } catch (error) {
      // If today's file doesn't exist, look for any file with the language pattern
      try {
        const files = await fs.readdir(downloadsDir);
        const matchingFile = files.find(file => 
          file.startsWith(`onenode-docs-${language}-`) && file.endsWith('.zip')
        );
        
        if (matchingFile) {
          const fallbackPath = path.join(downloadsDir, matchingFile);
          zipBuffer = await fs.readFile(fallbackPath);
        } else {
          throw new Error(`No documentation files found for ${language}`);
        }
      } catch (fallbackError) {
        console.error('Error finding documentation files:', fallbackError);
        return NextResponse.json({ 
          error: 'Documentation files not found. Please try again later or contact support.' 
        }, { status: 404 });
      }
    }
    
    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="onenode-docs-${language}-${todayDate}.zip"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error serving documentation:', error);
    return NextResponse.json({ 
      error: 'Failed to download documentation. Please try again later.' 
    }, { status: 500 });
  }
} 