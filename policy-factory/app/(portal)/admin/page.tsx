"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { 
  Users, 
  Shield, 
  Settings,
  Building2,
  UserPlus,
  Download,
  Upload,
  FileText,
  Plus
} from "lucide-react"

import departmentsConfig from "@/config/departments.json"
import rolesConfig from "@/config/roles.json"
import documentTypesConfig from "@/config/document_types.json"

// Mock users data
const mockUsers = [
  { id: 1, name: "Yasser Admin", email: "admin@shari.com", role: "SystemAdmin", department: "IT", status: "Active" },
  { id: 2, name: "GRC Manager", email: "grc@shari.com", role: "Reviewer_GRC", department: "GRC", status: "Active" },
  { id: 3, name: "Risk Officer", email: "risk@shari.com", role: "Reviewer_Risk", department: "Risk", status: "Active" },
  { id: 4, name: "AML Officer", email: "aml@shari.com", role: "Reviewer_AML", department: "AML", status: "Active" },
  { id: 5, name: "Credit Head", email: "credit@shari.com", role: "Approver", department: "Commercial", status: "Active" },
  { id: 6, name: "Finance Head", email: "finance@shari.com", role: "Approver", department: "Finance", status: "Active" },
]

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("users")
  const departments = (departmentsConfig as any).departments
  const roleMapping = (rolesConfig as any).ad_group_mapping
  const documentTypes = (documentTypesConfig as any).document_types

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 focus:outline-none">Administration</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, departments, and system settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All active
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleMapping.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Defined roles
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Organization units
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configuration items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Card className="border-none shadow-sm">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <CardHeader className="pb-3 border-b">
            <TabsList className="w-fit">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="types">Document Types</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          {/* Users Tab */}
          <TabsContent value="users" className="m-0">
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                <CardDescription>Manage user access and permissions</CardDescription>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="text-right font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-700">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal bg-purple-50 border-purple-200 text-purple-700">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal bg-slate-50">
                          {user.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="m-0">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-slate-50/50">
                <CardDescription>Role definitions and AD group mappings</CardDescription>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">AD Group</TableHead>
                    <TableHead className="font-semibold">Permissions</TableHead>
                    <TableHead className="text-right font-semibold">Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleMapping.map((role: any, idx: number) => {
                    const userCount = mockUsers.filter(u => u.role === role.role).length
                    return (
                      <TableRow key={idx} className="group hover:bg-blue-50/30 transition-colors">
                        <TableCell className="font-medium text-slate-700">{role.role}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-700">{role.ad_group}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {role.role.includes('Admin') ? 'Full Access' : 
                           role.role.includes('Approver') ? 'Approve Documents' :
                           role.role.includes('Reviewer') ? 'Review Documents' : 'Read Only'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-semibold">
                            {userCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="m-0">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-slate-50/50">
                <CardDescription>Organizational departments and ownership</CardDescription>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept: string, idx: number) => (
                    <Card key={idx} className="shadow-sm border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{dept}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Members:</span>
                            <span className="font-medium text-foreground">
                              {mockUsers.filter(u => u.department === dept).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Documents:</span>
                            <span className="font-medium text-foreground">
                              {Math.floor(Math.random() * 15) + 3}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </TabsContent>

          {/* Document Types Tab */}
          <TabsContent value="types" className="m-0">
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                <CardDescription>Manage policy and procedure types</CardDescription>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document Type
                </Button>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentTypes.map((type: string, idx: number) => (
                    <Card key={idx} className="shadow-sm border hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{type}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Count:</span>
                            <span className="font-medium text-foreground">
                              {type === 'Policy' ? 28 : type === 'Procedure' ? 16 : Math.floor(Math.random() * 10)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Document Type Definitions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Policy:</strong> High-level organizational directives</li>
                    <li><strong>Procedure:</strong> Step-by-step implementation guidelines</li>
                    <li><strong>WorkInstruction:</strong> Detailed operational instructions</li>
                    <li><strong>FormTemplate:</strong> Standard forms and templates</li>
                    <li><strong>Record:</strong> Evidence and documentation records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="m-0">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-slate-50/50">
                <CardDescription>System configuration and preferences</CardDescription>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Workflow Settings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Default Review SLA</span>
                      <Badge variant="outline">48 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Auto-escalation</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Email notifications</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Document Settings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Version control</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Default retention period</span>
                      <Badge variant="outline">7 years</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                      <span>Review cycle</span>
                      <Badge variant="outline">Annual</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
