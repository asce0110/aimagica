// Cloudflare Worker for API routes
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (path.startsWith('/api/')) {
        return handleAPIRoute(request, path, env);
      }

      // Default response
      return new Response('API Worker is running', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

async function handleAPIRoute(request, path, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Health check
  if (path === '/api/health') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      worker: 'api-worker' 
    }), {
      headers: corsHeaders
    });
  }

  // Test endpoint
  if (path === '/api/test') {
    return new Response(JSON.stringify({ 
      message: 'API Worker test successful',
      path: path,
      method: request.method,
      timestamp: new Date().toISOString()
    }), {
      headers: corsHeaders
    });
  }

  // Styles API
  if (path === '/api/styles' && request.method === 'GET') {
    // Mock response for now - replace with actual Supabase integration
    const styles = [
      { id: 1, name: 'Anime', category: 'art', featured: true },
      { id: 2, name: 'Realistic', category: 'photo', featured: true },
      { id: 3, name: 'Cartoon', category: 'art', featured: false }
    ];
    
    return new Response(JSON.stringify(styles), {
      headers: corsHeaders
    });
  }

  // Default API response
  return new Response(JSON.stringify({
    error: 'API endpoint not found',
    path: path,
    availableEndpoints: [
      '/api/health',
      '/api/test', 
      '/api/styles'
    ]
  }), {
    status: 404,
    headers: corsHeaders
  });
} 