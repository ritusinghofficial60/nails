"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Mail,
} from "lucide-react"

interface Stats {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  totalMessages: number
  unreadMessages: number
  totalUsers: number
}

interface RecentAppointment {
  id: string
  name: string
  service: string
  preferred_date: string
  preferred_time: string
  status: string
  created_at: string
}

interface RecentMessage {
  id: string
  name: string
  subject: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalUsers: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch appointments stats
        const { data: appointments } = await supabase
          .from("appointments")
          .select("status")
        
        const appointmentStats = {
          total: appointments?.length || 0,
          pending: appointments?.filter(a => a.status === "pending").length || 0,
          confirmed: appointments?.filter(a => a.status === "confirmed").length || 0,
          completed: appointments?.filter(a => a.status === "completed").length || 0,
        }

        // Fetch messages stats
        const { data: messages } = await supabase
          .from("contacts")
          .select("status")
        
        const messageStats = {
          total: messages?.length || 0,
          unread: messages?.filter(m => m.status === "unread").length || 0,
        }

        // Fetch users count
        const { data: users } = await supabase
          .from("profiles")
          .select("id")
        
        setStats({
          totalAppointments: appointmentStats.total,
          pendingAppointments: appointmentStats.pending,
          confirmedAppointments: appointmentStats.confirmed,
          completedAppointments: appointmentStats.completed,
          totalMessages: messageStats.total,
          unreadMessages: messageStats.unread,
          totalUsers: users?.length || 0,
        })

        // Fetch recent appointments
        const { data: recentAppts } = await supabase
          .from("appointments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)
        
        setRecentAppointments(recentAppts || [])

        // Fetch recent messages
        const { data: recentMsgs } = await supabase
          .from("contacts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)
        
        setRecentMessages(recentMsgs || [])
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
      case "unread":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Unread</Badge>
      case "read":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Read</Badge>
      case "replied":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Replied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold">{stats.totalAppointments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-4 w-4" />
                {stats.pendingAppointments} pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-3xl font-bold">{stats.confirmedAppointments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>{stats.completedAppointments} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-3xl font-bold">{stats.totalMessages}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span>{stats.unreadMessages} unread</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Registered accounts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest booking requests</CardDescription>
            </div>
            <Link href="/admin/appointments">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service} - {formatDate(appointment.preferred_date)} at {appointment.preferred_time}
                      </p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest contact form submissions</CardDescription>
            </div>
            <Link href="/admin/messages">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {message.subject}
                      </p>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/appointments">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Manage Appointments</span>
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <MessageSquare className="h-6 w-6" />
                <span>Read Messages</span>
              </Button>
            </Link>
            <Link href="/admin/services">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Update Services</span>
              </Button>
            </Link>
            <Link href="/admin/gallery">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Manage Gallery</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
