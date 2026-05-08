const BASE_URL = "http://4.224.186.213/evaluation-service/notifications";

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

export const fetchNotifications = async (
  page = 1,
  limit = 10,
  notificationType = "",
) => {
  try {
    let url = `${BASE_URL}?page=${page}&limit=${limit}`;
    console.log("TOKEN:", ACCESS_TOKEN);
    console.log("URL:", url);
    if (notificationType && notificationType !== "All") {
      url += `&notification_type=${notificationType}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("STATUS:", response.status);
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    console.log(data);
    return data.notifications;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
