import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Check } from "lucide-react";

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create admin user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gruppy-orange/10 via-white to-gruppy-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <User className="h-6 w-6 text-gruppy-orange" />
            Gruppy Setup
          </CardTitle>
          <CardDescription>
            Create your admin account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !error && (
            <Button 
              onClick={createAdminUser}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-gruppy-orange to-gruppy-blue hover:from-gruppy-orange/90 hover:to-gruppy-blue/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Admin account created successfully!
                </AlertDescription>
              </Alert>
              
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-blue-900">Login Credentials:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Email:</strong> {result.credentials?.email}</p>
                  <p><strong>Password:</strong> {result.credentials?.password}</p>
                </div>
              </div>

              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-gruppy-blue hover:bg-gruppy-blue/90"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
