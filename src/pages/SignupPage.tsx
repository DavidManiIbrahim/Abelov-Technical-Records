import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import loginBackground from '@/assets/login-background.jpg';
import abelovLogo from '@/assets/abelov-logo.png';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<'user' | 'admin'>('user');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                toast({
                    title: 'Error',
                    description: 'Passwords do not match',
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            // Validate password strength
            if (formData.password.length < 6) {
                toast({
                    title: 'Error',
                    description: 'Password must be at least 6 characters',
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            // Sign up the user (assign selected role)
            await signUp(formData.email, formData.password, userType);
            toast({
                title: 'Success',
                description: `Account created as ${userType}. You can now log in.`,
            });
            navigate('/login');
        } catch (error: Error | unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Signup failed';
            console.error('Signup error:', error);
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${loginBackground})` }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <Card className="w-full max-w-md p-8 shadow-2xl relative z-10 bg-white/95 backdrop-blur">
                <div className="mb-8 text-center">
                    <img src={abelovLogo} alt="Abelov Logo" className="w-20 rounded-3xl h-20 mx-auto mb-4" />
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-black text-primary mb-2">Abelov Records Management System</h1>
                    <p className="text-muted-foreground">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="dark:text-black" htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label className="dark:text-black" htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label className="dark:text-black" htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label className="dark:text-black" htmlFor="account-type">Account Type</Label>
                        <Select value={userType} onValueChange={(val) => setUserType(val as 'user' | 'admin')}>
                            <SelectTrigger id="account-type">
                                <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Regular User (Technician)</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full border" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-primary hover:underline">
                        Already have an account? Login
                    </Link>
                </div>
            </Card>
        </div>
    );
}
