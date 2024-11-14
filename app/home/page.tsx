import { MovieGrid } from "../components/MovieGrid";
import { MovieSlider } from "../components/MovieSliders/MovieSlider";
import { MovieSliderComedy } from "../components/MovieSliders/MovieSliderComedy";
import { MovieSliderDrama } from "../components/MovieSliders/MovieSliderDrama";
import { MovieSliderFolklore } from "../components/MovieSliders/MovieSliderFolklore";
import { MovieSliderHorror } from "../components/MovieSliders/MovieSliderHorror";
import { MovieSliderReco } from "../components/MovieSliders/MovieSliderReco";
import MovieVideo from "../components/MovieVideo";
import RecentlyAdded from "../components/RecentlyAdded";

export default async function HomePage() {
    // Assume we have the userId from somewhere (like session, context, or hardcoded for now)
    const userId = 1; // Replace with the actual way of getting userId dynamically

    return (
        <div className="p-5 lg:p-0">
            <MovieVideo />
            <h1 className="text-3xl font-bold text-gray-400">BEST FILMS</h1>
            <RecentlyAdded />
            <h1 className="text-3xl font-bold text-gray-400">POPULAR FILMS</h1>
            <MovieSlider />

            <h1 className="text-3xl font-bold text-gray-400">COMEDY</h1>
            <MovieSliderComedy />

            <h1 className="text-3xl font-bold text-gray-400">DRAMA</h1>
            <MovieSliderDrama />

            <h1 className="text-3xl font-bold text-gray-400">FOLKLORE</h1>
            <MovieSliderFolklore />

            <h1 className="text-3xl font-bold text-gray-400">HORROR</h1>
            <MovieSliderHorror />
            
            <h1 className="text-3xl font-bold text-gray-400">RECOMMENDED FOR YOU</h1>
            <MovieSliderReco userId={userId} />

            <h1 className="text-3xl font-bold text-gray-400">SOME OF THE BEST</h1>
            <MovieGrid/>
        </div>
    );
}
