// React Context

import dequal from 'dequal'
import React from 'react'
import { useAuth } from '../auth-context'
// ./context/user-context.js
// 🐨 you're gonna need these, so just uncomment it now :)
import * as userClient from '../user-client'


// 🐨 create your context here
const UserStateContext = React.createContext()
const UserDispatchContext = React.createContext()

function userReducer(state, action) {
  switch (action.type) {
    case 'start update': {
      return {
        ...state,
        user: { ...state.user, ...action.updates },
        status: 'pending',
        storedUser: state.user,
      }
    }
    case 'finish update': {
      return {
        ...state,
        user: action.updatedUser,
        status: 'resolved',
        storedUser: null,
        error: null,
      }
    }
    case 'fail update': {
      return {
        ...state,
        status: 'rejected',
        error: action.error,
        user: state.storedUser,
        storedUser: null,
      }
    }
    case 'reset': {
      return {
        ...state,
        status: null,
        error: null,
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function UserProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = React.useReducer(userReducer, {
    status: null,
    error: null,
    storedUser: user,
    user,
  })

  const canDispatch = React.useRef(true)
  React.useLayoutEffect(
    () => () => {
      canDispatch.current = false
    },
    [],
  )
  const safeDispatch = React.useCallback((...args) => {
    canDispatch.current && dispatch(...args)
  }, [])

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={safeDispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  )
}

function useUserState() {
  const context = React.useContext(UserStateContext)
  if (context === undefined) {
    throw new Error(`useUserState must be used within a UserProvider`)
  }

  return context
}

function useUserDispatch() {
  const context = React.useContext(UserDispatchContext)
  if (context === undefined) {
    throw new Error(`useUserDispatch must be used within a UserProvider`)
  }

  return context
}

async function updateUser(dispatch, user, updates) {
  dispatch({ type: 'start update', updates })
  try {
    const updatedUser = await userClient.updateUser(user, updates)
    dispatch({ type: 'finish update', updatedUser })
    return updatedUser
  } catch (error) {
    dispatch({ type: 'fail update', error })
    return Promise.reject(error)
  }
}


// src/screens/user-profile.js

// 🦉 here's where you'd normally import all the stuff you need from the context

function UserSettings() {
  const { user, status, error } = useUserState()
  const userDispatch = useUserDispatch()

  const isPending = status === 'pending'
  const isRejected = status === 'rejected'

  const [formState, setFormState] = React.useState(user)

  const isChanged = !dequal(user, formState)

  function handleChange(e) {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    updateUser(userDispatch, user, formState).catch(() => {
      /* ignore the error */
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(user)
            userDispatch({ type: 'reset' })
          }}
          disabled={!isChanged}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={(!isChanged && !isRejected) || isPending}
        >
          {isPending
            ? '...'
            : isRejected
              ? '✖ Try again'
              : isChanged
                ? 'Submit'
                : '✔'}
        </button>
        {isRejected ? (
          <div style={{ color: 'red' }}>
            <pre>{error.message}</pre>
          </div>
        ) : null}
      </div>
    </form>
  )
}

function UserDataDisplay() {
  const { user } = useUserState()
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}
/*
🦉 Elaboration & Feedback
After the instruction, copy the URL below into your browser and fill out the form:
http://ws.kcd.im/?ws=Advanced%20React%20Patterns&e=Context&em=
*/

////////////////////////////////////////////////////////////////////
//                                                                //
//                 Don't make changes below here.                 //
// But do look at it to see how your code is intended to be used. //
//                                                                //
////////////////////////////////////////////////////////////////////

function Usage() {
  return (
    <div
      style={{
        height: 350,
        width: 300,
        backgroundColor: '#ddd',
        borderRadius: 4,
        padding: 10,
      }}
    >
      <UserProvider>
        <UserSettings />
        <UserDataDisplay />
      </UserProvider>
    </div>
  )
}
Usage.title = 'Context'

export default Usage
