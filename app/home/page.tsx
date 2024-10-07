import { MovieSlider } from "../components/MovieSlider";
import MovieVideo from "../components/MovieVideo";
import RecentlyAdded from "../components/RecentlyAdded";

export default async function HomePage() {
   
    return (
        <div className="p-5 lg:p-0">
        <MovieVideo />
        <h1 className="text-3xl font-bold text-gray-400">BEST FILMS</h1>
        <RecentlyAdded />
        <h1 className="text-3xl font-bold text-gray-400">POPULAR FILMS</h1>
           <MovieSlider />
        </div>
    )
}