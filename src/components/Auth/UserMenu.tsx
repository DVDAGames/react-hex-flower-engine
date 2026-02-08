import { useState } from "react";
import { Menu, Avatar, Text, Group, UnstyledButton, ActionIcon, Tooltip } from "@mantine/core";
import { Link } from "react-router-dom";
import { User, LogOut, Shield, LogIn } from "lucide-react";
import { useAuth } from "@/contexts";
import { LoginModal } from "./LoginModal";
import { ProfileModal } from "./ProfileModal";
import { HexIcon } from "@/components/HexIcon";
import classes from "./UserMenu.module.css";

export function UserMenu() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <ActionIcon variant="subtle" size="lg" loading aria-label="Loading">
        <User size={18} />
      </ActionIcon>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Tooltip label="Sign in">
          <ActionIcon variant="subtle" size="lg" onClick={() => setLoginModalOpen(true)} aria-label="Sign in">
            <LogIn size={18} />
          </ActionIcon>
        </Tooltip>
        <LoginModal opened={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <UnstyledButton className={classes.userButton}>
            <Group gap="xs">
              <Avatar alt={user?.displayName || user?.email || "User"} radius="xl" size="sm" color="violet">
                {user?.avatarUrl ? <HexIcon icon={user.avatarUrl} size={16} /> : <User size={16} />}
              </Avatar>
              <Text size="sm" fw={500} className={classes.userName}>
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </Text>
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Text size="xs" c="dimmed">
              Signed in as
            </Text>
            <Text size="sm" fw={500} truncate>
              {user?.email}
            </Text>
          </Menu.Label>

          <Menu.Divider />

          <Menu.Item leftSection={<User size={16} />} onClick={() => setProfileModalOpen(true)}>
            Edit Profile
          </Menu.Item>

          {user?.isAdmin && (
            <>
              {/* Admin link placed directly under Edit Profile for quick access */}
              <Menu.Item leftSection={<Shield size={16} />} component={Link} to="/admin/review">
                Review submissions
              </Menu.Item>
              <Menu.Divider />
            </>
          )}

          <Menu.Divider />

          <Menu.Item leftSection={<LogOut size={16} />} color="red" onClick={() => signOut()}>
            Sign out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <ProfileModal opened={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </>
  );
}

export default UserMenu;
