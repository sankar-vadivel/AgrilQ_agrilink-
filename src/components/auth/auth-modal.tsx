import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { apiCall, setAuthToken } from "@/lib/api"

export function AuthModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null)
    const navigate = useNavigate()
    const { login, signup } = useAuth()

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setEmail("")
            setPassword("")
            setName("")
            setRole("customer")
            setUserLoc(null)
        }
    }, [isOpen])

    const fetchLocation = async () => {
        setLocationLoading(true)
        const loc = await getLocation()
        if (loc) {
            setUserLoc(loc)
            toast.success("Location acquired successfully!")
        } else {
            toast.error("Failed to get location. Please allow location access.")
        }
        setLocationLoading(false)
    }

    // Form states
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<"farmer" | "customer">("customer")
    const [name, setName] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
        return new Promise((resolve) => {
            if ("geolocation" in navigator) {
                console.log("Requesting geolocation...");
                const timeoutId = setTimeout(() => {
                    console.warn("Geolocation request timed out");
                    resolve(null);
                }, 5000); // 5 second timeout

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeoutId);
                        console.log("Geolocation obtained:", position.coords);
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        })
                    },
                    (error) => {
                        clearTimeout(timeoutId);
                        console.error("Error getting location:", error)
                        resolve(null)
                    },
                    { enableHighAccuracy: false, timeout: 5000 } // Accuracy priority reduced for speed
                )
            } else {
                console.warn("Geolocation not supported by browser");
                resolve(null)
            }
        })
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        // Mock Google Login
        setTimeout(() => {
            const mockUser = {
                uid: "google_" + Math.random().toString(36).substr(2, 9),
                email: "google.user@example.com",
                displayName: "Google User",
                role: role
            }
            login(mockUser)
            toast.success("Logged in with Google (Mock)")
            setIsOpen(false)
            setLoading(false)
            navigate("/")
        }, 1000)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                requiresAuth: false
            });
            
            setAuthToken(data.token);
            
            login({
                uid: data.user.id,
                email: data.user.email,
                displayName: data.user.name,
                role: data.user.role,
                location: userLoc
            });
            
            toast.success("Logged in successfully");
            setIsOpen(false);
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const createUser = async (loc: { lat: number; lng: number } | null) => {
            try {
                const payload: any = {
                    name,
                    email,
                    password,
                    role
                };
                if (loc) {
                    payload.longitude = loc.lng;
                    payload.latitude = loc.lat;
                }
                
                await apiCall('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    requiresAuth: false
                });
                
                // On successful register, login automatically
                const loginData = await apiCall('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                    requiresAuth: false
                });
                
                setAuthToken(loginData.token);
                
                signup({
                    uid: loginData.user.id,
                    email: loginData.user.email,
                    displayName: loginData.user.name,
                    role: loginData.user.role as "farmer" | "customer",
                    location: loc
                });

                toast.success("Account created successfully");
                setIsOpen(false);
                navigate("/");
            } catch (error: any) {
                toast.error(error.message || "Signup failed");
            } finally {
                setLoading(false);
            }
        }

        // Use the pre-fetched location if available, otherwise just create user
        createUser(userLoc)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Login</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to AgriLink</DialogTitle>
                    <DialogDescription>
                        Login or create an account to get started.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                                Google
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup">
                        <form onSubmit={handleSignup} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">I am a</Label>
                                <Select value={role} onValueChange={(value: "farmer" | "customer") => setRole(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="farmer">Farmer</SelectItem>
                                        <SelectItem value="customer">Customer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                                <Label className="text-sm font-semibold flex items-center justify-between">
                                    <span>Location Access</span>
                                    {userLoc && <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">Saved ✓</span>}
                                </Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    {role === "farmer" 
                                        ? "Allow location so customers can find your farm on the map." 
                                        : "Allow location to sort farmers by distance from you."}
                                </p>
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full text-xs font-bold" 
                                    onClick={fetchLocation}
                                    disabled={locationLoading || !!userLoc}
                                >
                                    {locationLoading ? "Getting Location..." : userLoc ? "Location Acquired" : "Fetch My Location"}
                                </Button>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating Account..." : "Create Account"}
                            </Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                                Google
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
