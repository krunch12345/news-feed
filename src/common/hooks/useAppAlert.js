import { createContext, useContext } from 'react'

export const AppAlertContext = createContext({
  showAlert: () => {},
})

export const useAppAlert = () => useContext(AppAlertContext)
