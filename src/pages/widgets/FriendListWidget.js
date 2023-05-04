import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_USER } from "../../Global";
import { setFriends, setLogout } from "../../state/store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WidgetWrapper from "../../components/WidgetWrapper";
import Friend from "../../components/Friend";

export default function FriendListWidget({ userId }) {
  const [listLoading, setListLoading] = useState(false);

  const dispatch = useDispatch();
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends);

  const getFriends = () => {
    setListLoading(true);
    axios
      .get(`${API_USER}/friendList/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(
          setFriends({
            friends: response.data,
          })
        );
        setListLoading(false);
      })
      .catch((error) => {
        toast.error(
          error.response.data ? error.response.data.message : error.message
        );
        setListLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  useEffect(() => {
    getFriends();
  }, []);

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

      <WidgetWrapper>
        <Typography
          color={palette.neutral.dark}
          variant="h5"
          fontWeight="500"
          sx={{
            mb: "1.5rem",
          }}
        >
          Friend List
        </Typography>

        <Box display="flex" flexDirection="column" gap="0.5rem">
          {listLoading ? (
            <CircularProgress
              size="2rem"
              sx={{ display: "flex", alignSelf: "center", m: "1rem" }}
            />
          ) : friends.length > 0 ? (
            friends.map((friend, i) => (
              <Friend
                key={i}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath}
              />
            ))
          ) : (
            <Typography sx={{ mb: "1rem", color: palette.neutral.medium }}>
              No friends yet
            </Typography>
          )}
        </Box>
      </WidgetWrapper>
    </>
  );
}
