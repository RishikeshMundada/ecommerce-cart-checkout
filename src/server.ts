import app from './app';

const PORT = process.env.PORT ?? '3000';

app.listen(parseInt(PORT, 10), () => {
  console.log(`server running on port ${PORT}`);
});
