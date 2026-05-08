const Log = async (stack, level, pkg, message) => {
  try {
    const response = await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2aXNodWRkaGkwMzAzLmphaW5AZ21haWwuY29tIiwiZXhwIjoxNzc4MjMxNTM4LCJpYXQiOjE3NzgyMzA2MzgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4NDJhNjU5MC05NDcwLTQ2YzQtOTcxNi00YjAwODYwYjVlNzciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ2aXNodWRkaGkgamFpbiIsInN1YiI6Ijg5ZDc4ZDc2LTE0ZmYtNDQ5Ni05YTM1LTFjYWYyNDMxNmNmNCJ9LCJlbWFpbCI6InZpc2h1ZGRoaTAzMDMuamFpbkBnbWFpbC5jb20iLCJuYW1lIjoidmlzaHVkZGhpIGphaW4iLCJyb2xsTm8iOiIyMzEwNDA0NyIsImFjY2Vzc0NvZGUiOiJNZHByaEUiLCJjbGllbnRJRCI6Ijg5ZDc4ZDc2LTE0ZmYtNDQ5Ni05YTM1LTFjYWYyNDMxNmNmNCIsImNsaWVudFNlY3JldCI6IkFOeG1oeEVnRmVGUURXS2sifQ.4FUYxLdawScY8G-EfYx0edFavVK60l-p1plLAWjadkU`
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message
      })
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export default Log;