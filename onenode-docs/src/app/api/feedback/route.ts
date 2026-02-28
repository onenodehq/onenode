import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Invalid feedback message' 
      }, { status: 400 });
    }
    
    // Get the API base URL from environment
    const apiBaseUrl = process.env.NEXT_PUBLIC_ONENODE_URL;
    
    if (!apiBaseUrl) {
      console.error('NEXT_PUBLIC_ONENODE_URL environment variable is not set');
      return NextResponse.json({ 
        status: 'error', 
        message: 'API configuration error' 
      }, { status: 500 });
    }
    
    // Forward the feedback to the actual endpoint
    const response = await fetch(`${apiBaseUrl}/private/docs-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': process.env.ONENODE_ADMIN_API_KEY || '',
      },
      body: JSON.stringify({ message: body.message }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to send feedback: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Return the response from the actual endpoint
    return NextResponse.json({ 
      status: 'success', 
      message: 'Feedback received successfully',
      timestamp: new Date().toISOString(),
      feedbackId: responseData.feedbackId || `feedback_${Date.now()}`,
      apiResponse: responseData
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing feedback:', error);
    
    // Return an error response
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to process feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 