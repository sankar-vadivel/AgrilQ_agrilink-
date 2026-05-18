import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { MapPin, Upload, UserCircle, Camera } from "lucide-react"

interface ProfileModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function ProfileModal({ isOpen, setIsOpen }: ProfileModalProps) {
    const { user, updateProfile } = useAuth()
    
    const [name, setName] = useState("")
    const [photo, setPhoto] = useState<string | null>(null)
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load user data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setName(user.displayName || "")
            setPhoto(user.photoURL || null)
            setLocation(user.location || null)
        }
    }, [isOpen, user])

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("Image must be less than 2MB")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPhoto(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const fetchLocation = () => {
        setLocationLoading(true)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    toast.success("Location acquired successfully!")
                    setLocationLoading(false)
                },
                (error) => {
                    console.error("Location error:", error)
                    toast.error("Failed to get location. Please allow location access.")
                    setLocationLoading(false)
                },
                { enableHighAccuracy: true, timeout: 5000 }
            )
        } else {
            toast.error("Geolocation is not supported by your browser")
            setLocationLoading(false)
        }
    }

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty")
            return
        }

        setIsSaving(true)
        updateProfile({
            displayName: name,
            photoURL: photo || undefined,
            location: location
        })
        
        toast.success("Profile updated successfully")
        setIsSaving(false)
        setIsOpen(false)
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your personal details, profile picture, and location.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 pt-4">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {photo ? (
                                <img src={photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-muted/50" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center border-4 border-muted/20">
                                    <UserCircle className="w-16 h-16 text-muted-foreground/50" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Click to upload photo (Max 2MB)</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                        />
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                            id="displayName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                        <Label className="text-sm font-semibold flex items-center justify-between">
                            <span>Location Access</span>
                            {location && <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">Saved ✓</span>}
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            {user.role === "farmer" 
                                ? "Update your farm's location to appear accurately on the map." 
                                : "Update your location to see precise distances to farmers."}
                        </p>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="w-full text-xs font-bold" 
                            onClick={fetchLocation}
                            disabled={locationLoading}
                        >
                            {locationLoading ? "Getting Location..." : location ? "Update My Location" : "Fetch My Location"}
                        </Button>
                    </div>

                    <Button className="w-full btn-primary-glow" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
