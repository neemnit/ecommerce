"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserById, fetchUserSession } from "../features/users/userSlice";
import { useAppSelector, useAppDispatch } from "../hook";
import { getAddress } from "../features/address/addressSlice";

const LoginSuccessWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccess />
    </Suspense>
  );
};

const LoginSuccess: React.FC = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const addresses = useAppSelector((state) => state.address.addresses);
  const loading = useAppSelector((state) => state.user.loading);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    const handleLoginFlow = async () => {
      if (!sessionId) {
        router.replace("/");
        return;
      }

      try {
        const userData = await dispatch(fetchUserSession(sessionId)).unwrap();

        // Fetch address after successful login
        await dispatch(getAddress()).unwrap();

        // Fetch user data by ID
        if (userData?.id) {
          await dispatch(fetchUserById(userData.id)).unwrap();
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error during login flow:", error);
        router.replace("/login-failed"); // Redirect on error
      }
    };

    handleLoginFlow();
  }, [sessionId, dispatch, router]);

  useEffect(() => {
    const redirectToPage = async () => {
      if (isDataLoaded && isAuthenticated && user?._id) {
        const userAddress = addresses.find((addr) => addr.userId === user._id);
        router.replace(userAddress ? "/order" : "/address");

        // Prevent infinite redirects
        setIsDataLoaded(false);
      }
    };

    redirectToPage();
  }, [isDataLoaded, isAuthenticated, user?._id, addresses, router]);

  return (
    <div>
      <h2>{loading ? "Logging in..." : "Login Successful"}</h2>
      {isAuthenticated && user && <p>Welcome, {user.name}!</p>}
    </div>
  );
};

export default LoginSuccessWrapper;
