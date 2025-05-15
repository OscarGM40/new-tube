"use client";
import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Fragment } from "react";
import Link from "next/link";

// Este compo es el modal personalizable que se abre al estar logeados y pulsar en nuestro Avatar. Otro name hubiera sido mejor
export const AuthButton = () => {
  return (
    <Fragment>
      {/* Fijate que SignedIn y Out son HOCs en base al authState que ya sabrá Clerk  */}
      <SignedIn>
        <Button asChild variant="secondary">
          <Link href="/studio">
            <ClapperboardIcon className="size-4" />
            Studio
          </Link>
        </Button>
        <UserButton>
          <UserButton.MenuItems>
            {/* TODO: add UserProfile */}
            <UserButton.Link
              label="Studio"
              href="/studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 text-small font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none [&_svg]:size-5"
          >
            <UserCircleIcon />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </Fragment>
  );
};
