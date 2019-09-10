// React Context

import dequal from 'dequal'
import React, { createContext, useContext, useReducer } from 'react'
import { useAuth } from '../auth-context'
// ./context/user-context.js
// 🐨 you're gonna need these, so just uncomment it now :)
import * as userClient from '../user-client'


// 🐨 create your context here
const UserContext = createContext()

const reducer = (state, action) => {
  switch (action.type) {
    case 'update':
      return { ...state, user: action.updatedUser}
    case 'reset':
      return state

    default:
      break;
  }
}

function UserProvider({children}) {
  // 🐨 get the user from the useAuth hook so you can use that as your initial
  // state for this context provider
  // 💰 const {user} = useAuth()
  const { user } = useAuth()

  // 🐨 useReducer here with a reducer you write and initialize it with the user
  // you got from useAuth
  // 💰 the reducer should handle an action type called `update` which will be
  // dispatched in the `updateUser` helper below
  const [state, dispatch] = useReducer(reducer, { user })

  // 🐨 render state and dispatch as values to a context provider here
  // 💰 make sure you don't forget to render {children} as well!
  return (
    <UserContext.Provider value={{ state, dispatch}}>
      {children}
    </UserContext.Provider>
  )
}

// 🦉 You don't have to do this, but one good idea is to create a custom hook
// which retrieves the context value via React.useContext, then people can use
// your custom hook. If you want to try that, then go ahead and put it here.

// This is a utility function which accepts the reducer's dispatch function
// as well as the user and any updates. It's responsible for interacting with
// the userClient and the dispatch.
async function updateUser(dispatch, user, updates) {
  // 🐨 use the userClient.updateUser function to send updates to the backend
  // 🐨 then when that's completed, dispatch an 'update' action with the updated
  // user information you get back
  // 💰 userClient.updateUser(user, updates) returns a promise which resolves
  // to the updatedUser.
  // 💰 this is an async function so you can use `await` if you want :)
  const updatedUser = await userClient.updateUser(user, updates)
  dispatch({ type: 'update', updatedUser})
}

// 🦉 here's where you'd normally export all this stuff
function useUserState() {
  const { state } = useContext(UserContext)

  if (state === undefined) {
    throw new Error('useUserState must be used within a UserContext.Provider')
  }
  return state
}

function useUserDispatch() {
  const { dispatch } = useContext(UserContext)

  if (dispatch === undefined) {
    throw new Error('useUserDispatch must be used within a UserContext.Provider')
  }
  return dispatch
}

// src/screens/user-profile.js

// 🦉 here's where you'd normally import all the stuff you need from the context

function UserSettings() {
  // 🐨 get the user object and userDispatch function from context
  const { user, status, error } = useUserState()
  const userDispatch = useUserDispatch()

  const isPending = status === 'pending'
  const isRejected = status === 'rejected'

  const [formState, setFormState] = React.useState(user)

  const isChanged = !dequal(user, formState)

  function handleChange(e) {
    setFormState({...formState, [e.target.name]: e.target.value})
  }

  function handleSubmit(event) {
    event.preventDefault()
    // 🦉 notice that this code no longer does anything but call `updateUser`
    updateUser(userDispatch, user, formState)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(user)
            userDispatch({ type: 'reset' })
          }}
          disabled={!isChanged || isPending}
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
          <div style={{color: 'red'}}>
            <pre>{error.message}</pre>
          </div>
        ) : null}
      </div>
    </form>
  )
}

function UserDataDisplay() {
  // 🐨 get the user from context
  const { user } = useUserState()
  return (
    <pre data-testid="user-data-display">{JSON.stringify(user, null, 2)}</pre>
  )
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
