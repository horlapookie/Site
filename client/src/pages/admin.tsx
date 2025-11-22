import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Server, AlertCircle, Clock, Coins, ArrowLeft, BadgeCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Block non-admin users immediately
  if (!user || !user.isAdmin) {
    setLocation("/dashboard");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const { data: stats = { bots: { total: 0, running: 0, failed: 0, deploying: 0 }, users: 0 }, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} isAdmin={user.isAdmin} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage bots and monitor platform statistics
          </p>
        </div>

        {/* Admin Profile Card */}
        <Card className="mb-8 border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-500" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coin Balance</p>
                <div className="flex items-center gap-2 mt-1">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <p className="text-2xl font-bold">{user.coins}</p>
                  <span className="text-sm text-muted-foreground">coins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" data-testid="loader-stats" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-total-bots">
                    {stats?.bots?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600" data-testid="text-running-bots">
                    {stats?.bots?.running || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active deployments
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600" data-testid="text-failed-bots">
                    {stats?.bots?.failed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-deleted after 5 days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deploying</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-deploying-bots">
                    {stats?.bots?.deploying || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In progress
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                </CardTitle>
                <CardDescription>
                  All registered users and their coin balances
                </CardDescription>
              </div>
              <Badge variant="secondary" data-testid="badge-total-users">
                {users?.length || 0} users
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Coins</TableHead>
                      <TableHead className="text-center">Bots</TableHead>
                      <TableHead className="text-center">Referrals</TableHead>
                      <TableHead className="text-center">Auto-Monitor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((user: any) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold" data-testid={`text-coins-${user.id}`}>
                                {user.coins}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center" data-testid={`text-bot-count-${user.id}`}>
                            {user.botCount}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.referralCount || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.autoMonitor === 1 ? (
                              <Badge variant="default" className="text-xs">Enabled</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge variant="default">Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
