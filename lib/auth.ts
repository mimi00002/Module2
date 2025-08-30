import { storage, type User } from "./storage"

export const auth = {
  login: (username: string, password: string): User | null => {
    const users = storage.getUsers()
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      storage.setCurrentUser(user)
      return user
    }
    return null
  },

  logout: () => {
    storage.setCurrentUser(null)
  },

  getCurrentUser: (): User | null => {
    return storage.getCurrentUser()
  },

  isAuthenticated: (): boolean => {
    return storage.getCurrentUser() !== null
  },

  isAdmin: (): boolean => {
    const user = storage.getCurrentUser()
    return user?.type === "admin"
  },

  isTechnician: (): boolean => {
    const user = storage.getCurrentUser()
    return user?.type === "technician"
  },
}
