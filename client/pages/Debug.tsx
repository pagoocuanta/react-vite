import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';

export default function Debug() {
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check environment variables
    const config = {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      supabaseUrlFromClient: supabase.supabaseUrl,
      supabaseKeyFromClient: supabase.supabaseKey
    };
    setSupabaseConfig(config);
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connectivity
      const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
      
      setConnectionTest({
        success: !error,
        data,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setConnectionTest({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    setIsLoading(true);
    try {
      // Test auth endpoint connectivity
      const { data, error } = await supabase.auth.getSession();
      
      setConnectionTest({
        success: !error,
        type: 'auth',
        data,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setConnectionTest({
        success: false,
        type: 'auth',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Configuration Debug</CardTitle>
            <CardDescription>Debug information for Supabase connection issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(supabaseConfig, null, 2)}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={isLoading}>
                Test Database Connection
              </Button>
              <Button onClick={testAuth} disabled={isLoading} variant="outline">
                Test Auth Connection
              </Button>
            </div>

            {connectionTest && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Connection Test Result</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(connectionTest, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Common Issues</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set</li>
                <li>• Verify Supabase project is not paused</li>
                <li>• Check network connectivity</li>
                <li>• Ensure environment variables start with VITE_ for client-side</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
