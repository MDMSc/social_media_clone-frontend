import { Box, useMediaQuery } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_USER } from '../Global';
import { setLogout } from '../state/store';
import Navbar from './Navbar';
import UserWidget from './widgets/UserWidget';
import MyPostWidget from './widgets/MyPostWidget';
import PostsWidget from './widgets/PostsWidget';
import FriendListWidget from './widgets/FriendListWidget';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {userId} = useParams();
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const getUser = () => {
    axios
      .get(`${API_USER}/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  }

  useEffect(() => {
    getUser();
  }, [userId]);

  if(!user) return null;

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />

      <Box>
        <Navbar />
        <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={userId} picturePath={user.picturePath} />
          <Box m="2rem 0" />
          <FriendListWidget userId={userId} />
        </Box>
        
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          <MyPostWidget picturePath={user.picturePath} />
          <Box m="2rem 0" />
          <PostsWidget userId={userId} isProfile={true} />
        </Box>

      </Box>
      </Box>
    </>
  )
}
