import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  MenuList,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FlexBetween from "../components/FlexBetween";
import {
  Notifications,
  Message,
  LightMode,
  DarkMode,
  Search,
  Menu,
  Help,
  Close,
} from "@mui/icons-material";
import { setMode, setLogout } from "../state/store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_USER } from "../Global";
import Friend from "../components/Friend";

export default function Navbar() {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  useEffect(() => {
    setSearchLoading(true);
    axios
      .get(`${API_USER}?search=${search}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSearchResults(response.data);
        setSearchLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setSearchLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  }, [search]);

  const logout = () => {
    setLogoutLoading(true);
    axios
      .post(
        `${API_USER}/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setLogoutLoading(false);
        dispatch(setLogout());
        toast(`${response.data.message}`);
        setInterval(() => {
          navigate("/");
        }, 3000);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setLogoutLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
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

      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          SM-Clone
        </Typography>
        {isNonMobileScreens && (
          <Box
            sx={{
              position: "relative",
            }}
          >
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="9px"
              gap="3rem"
              padding="0.1rem 1.5rem"
            >
              <InputBase
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>

            <MenuList
              sx={{
                position: "absolute",
                top: 40,
                left: 0,
                backgroundColor: theme.palette.background.alt,
                borderRadius: "1rem",
                width: "20rem",
                maxHeight: "20rem",
                display: Boolean(search) ? "flex" : "none",
                flexDirection: "column",
                p: "1rem",
                mt: "0.5rem",
                overflowY: "scroll",
              }}
            >
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => setSearch("")}>
                  <Close />
                </IconButton>
              </Box>
              {searchLoading ? (
                <CircularProgress size="2rem" sx={{display: "flex", alignSelf: "center", m: "1rem"}} />
              ) : searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <Friend
                    key={res._id}
                    friendId={res._id}
                    name={`${res.firstName} ${res.lastName}`}
                    subtitle={res.occupation}
                    userPicturePath={res.picturePath}
                  />
                ))
              ) : (
                <Typography sx={{ color: theme.palette.neutral.medium }}>
                  No results...
                </Typography>
              )}
            </MenuList>
          </Box>
        )}
      </FlexBetween>

      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <Message sx={{ fontSize: "25px" }} />
          <Notifications sx={{ fontSize: "25px" }} />
          <Help sx={{ fontSize: "25px" }} />
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                minWidth: "150px",
                maxWidth: "180px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  logout()
                }}
              >
                {logoutLoading ? <CircularProgress size="2rem" sx={{display: "flex", alignSelf: "center"}} /> : "Logout"}
              </MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <Message sx={{ fontSize: "25px" }} />
            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  minWidth: "150px",
                  maxWidth: "180px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logout();
                  }}
                >
                  {logoutLoading ? <CircularProgress size="2rem" sx={{display: "flex", alignSelf: "center"}} /> : "Logout"}
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
}
