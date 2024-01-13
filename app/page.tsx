export default async function MainPage() {
  return (
    <form method={"GET"} action={"./article"}>
      <input type={"text"} name={"url"} />
      <button type={"submit"}>Search</button>
    </form>
  );
}
