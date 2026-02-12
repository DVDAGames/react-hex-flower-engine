import { useEffect, useCallback, useState } from "react";
import { Container, Table, Group } from "@mantine/core";

import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "../PageLayout";
import { AuthUser, getAllUsers } from "@/lib/api";
import { Check, User, ShieldCheck } from "lucide-react";
import { HexIcon } from "../HexIcon";

export function UserManagement() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<Partial<AuthUser>[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const { data, error: apiError } = await getAllUsers();

      if (apiError) {
        console.error("API error fetching users:", apiError);
        return;
      }

      if (!data) {
        console.error("No data received when fetching users");
        return;
      }

      setUsers(data?.users);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      loadUsers();
    }
  }, [isAuthenticated, user?.isAdmin, authLoading, loadUsers]);

  return (
    <PageLayout>
      <Container fluid py="xl" mt="2xl" w="80%">
        <Table highlightOnHover w="100%">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Display Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Joined</Table.Th>
              <Table.Th>Accepted Terms</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u: Partial<AuthUser>) => (
              <Table.Tr key={u.id}>
                <Table.Td>
                  <Group>
                    {u.avatarUrl ? <HexIcon icon={u.avatarUrl} size={24} /> : <User size={24} />}
                    {u.displayName || "N/A"}
                  </Group>
                </Table.Td>
                <Table.Td>{u.email}</Table.Td>
                <Table.Td>
                  <Group>{u.isAdmin ? <ShieldCheck size={24} /> : <User size={24} />}</Group>
                </Table.Td>
                <Table.Td>{u.createdAt}</Table.Td>
                <Table.Td>{u?.acceptTerms ? <Check /> : <></>}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Container>
    </PageLayout>
  );
}

export default UserManagement;
