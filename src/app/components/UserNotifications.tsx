import { useState, useEffect, Fragment } from "react";
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Chip,
} from "@mui/material";
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon,
  Delete,
} from "@mui/icons-material";

interface Notification {
  id: number;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "AI Search Completed",
      message: "Your recent AI search query has been processed successfully by ChatGPT and Claude.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "System Update",
      message: "LunaAI has been updated to version 2.1.0 with improved multi-model chaining.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Token Limit Warning",
      message: "You have used 80% of your monthly token allocation. Consider upgrading your plan.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Support Ticket Resolved",
      message: "Your support ticket TKT-12345 has been resolved by our technical team.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle sx={{ color: "#22c55e" }} />;
      case "info":
        return <Info sx={{ color: "#3b82f6" }} />;
      case "warning":
        return <Warning sx={{ color: "#f59e0b" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "#ef4444" }} />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Box className="mb-6">
        <Box className="flex items-center gap-3">
          <Badge badgeContent={unreadCount} color="error">
            <Notifications fontSize="large" />
          </Badge>
          <div>
            <Typography variant="h4" className="mb-1">
              Notifications
            </Typography>
            <Typography variant="body2" className="text-slate-600">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </Typography>
          </div>
        </Box>
      </Box>

      {notifications.length === 0 ? (
        <Paper className="p-8 text-center">
          <NotificationsActive sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" className="text-slate-600">
            No notifications yet
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-2">
            We'll notify you when something important happens
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <Fragment key={notification.id}>
                <ListItem
                  className={`${!notification.read ? "bg-blue-50" : ""}`}
                  sx={{
                    "&:hover": { backgroundColor: notification.read ? "#f8f9fa" : "#e0f2fe" },
                    cursor: "pointer",
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemIcon>{getIcon(notification.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box className="flex items-center gap-2">
                        <Typography variant="subtitle1" component="span" className="font-semibold">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" className="text-slate-700 block mt-1">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" component="span" className="text-slate-500 block mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}