'use client'

import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

function Header() {
  const { user } = useUser()

  return (
    <div className="flex items-center justify-between  p-5">
      <div>
        {user && (
          <h1 className="text-lg font-semibold">
            {user?.firstName}
            {`'s`} Space
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </div>
  )
}

export default Header