import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function PatientProfile() {
  return (
    <LayoutShell role="patient">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold font-heading">My Profile</h1>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-2xl font-bold">Alex Doe</h2>
                <p className="text-muted-foreground">Patient ID: #88219</p>
                <p className="text-sm text-primary font-medium">Rehab Plan: Stroke Recovery A</p>
              </div>
              <div className="md:ml-auto">
                <Button variant="outline">Edit Photo</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your contact details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" defaultValue="42" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 (555) 000-0000" />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Assigned Therapist</Label>
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  SC
                </div>
                <div>
                  <p className="font-medium">Dr. Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">Physiotherapist</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}
