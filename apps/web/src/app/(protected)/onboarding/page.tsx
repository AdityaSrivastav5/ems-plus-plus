"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

const CREATE_ORG = gql`
  mutation CreateOrganization($name: String!, $slug: String!) {
    createOrganization(name: $name, slug: $slug) {
      id
      name
      slug
    }
  }
`;

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [createOrg, { loading, error }] = useMutation<any>(CREATE_ORG);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createOrg({ variables: { name, slug } });
      if (data?.createOrganization) {
        localStorage.setItem("currentOrgId", data.createOrganization.id);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to create org", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
          <BuildingOfficeIcon className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your Organization
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get started by setting up your company workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium leading-6 text-gray-900">
                Organization Name
              </label>
              <div className="mt-2">
                <input
                  id="org-name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="org-slug" className="block text-sm font-medium leading-6 text-gray-900">
                Workspace URL
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">ems.com/</span>
                <input
                  type="text"
                  name="slug"
                  id="org-slug"
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="acme"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error.message}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
