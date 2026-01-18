import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const GroupContext = createContext({})

export const useGroup = () => useContext(GroupContext)

export function GroupProvider({ children }) {
  const { user } = useAuth()
  const [member, setMember] = useState(null)
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMember(null)
      setGroup(null)
      setLoading(false)
      return
    }

    async function loadMemberAndGroup() {
      // Get member record for this user (might not exist yet)
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*, group:groups(*)')
        .eq('user_id', user.id)
        .maybeSingle()  // Use maybeSingle instead of single

      if (memberError) {
        console.log('Error loading member:', memberError.message)
        setLoading(false)
        return
      }

      if (!memberData) {
        // User exists but hasn't joined a group yet - that's okay
        console.log('User has not joined a group yet')
        setMember(null)
        setGroup(null)
        setLoading(false)
        return
      }

      setMember(memberData)
      setGroup(memberData.group)
      setLoading(false)
    }

    loadMemberAndGroup()
  }, [user])

  return (
    <GroupContext.Provider value={{ member, group, loading }}>
      {children}
    </GroupContext.Provider>
  )
}