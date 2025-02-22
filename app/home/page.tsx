export const dynamic = "force-dynamic";


import { FilmSlider } from "../components/FilmSliders/FilmSlider";
import { FilmSliderComedy } from "../components/FilmSliders/FilmSliderComedy";
import { FilmSliderDrama } from "../components/FilmSliders/FilmSliderDrama";
import { FilmSliderFolklore } from "../components/FilmSliders/FilmSliderFolklore";
import { FilmSliderHorror } from "../components/FilmSliders/FilmSliderHorror";
import { FilmSliderReco } from "../components/FilmSliders/FilmSliderReco";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import { auth } from "@clerk/nextjs/server";
import { TextLoop } from "@/components/ui/text-loop";

export default async function HomePage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <div className="text-center p-8 border border-red-600 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                    <p className="text-xl mb-6">You must be logged in to view this page.</p>
                    <a
                        href="/sign-in"
                        className="inline-block px-6 py-3 text-lg font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Login Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[4rem] lg:pt-[5rem] p-5 lg:p-0">
            <FilmVideo />
            
            <h1 className="text-3xl font-bold text-gray-400">
                <TextLoop
                    className="overflow-y-clip"
                    transition={{
                        type: "spring",
                        stiffness: 900,
                        damping: 80,
                        mass: 10,
                    }}
                    variants={{
                        initial: { y: 20, rotateX: 90, opacity: 0, filter: "blur(4px)" },
                        animate: { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" },
                        exit: { y: -20, rotateX: -90, opacity: 0, filter: "blur(4px)" },
                    }}
                >
                    <span>BEST FILMS</span>
                    <span>TOP MOVIES</span>
                    <span>AWARD WINNERS</span>
                </TextLoop>
            </h1>

                <RecentlyAdded />

            {[
                { title: "POPULAR FILMS", component: <FilmSlider /> },
                { title: "COMEDY FILMS", component: <FilmSliderComedy /> },
                { title: "DRAMA FILMS", component: <FilmSliderDrama /> },
                { title: "FOLKLORE FILMS", component: <FilmSliderFolklore /> },
                { title: "HORROR FILMS", component: <FilmSliderHorror /> },
                { title: "RECOMMENDED FOR YOU", component: <FilmSliderReco userId={userId.toString()} /> },
            ].map(({ title, component }) => (
                <div key={title} className="mt-6">
                    <h1 className="text-3xl font-bold text-gray-400">
                        <TextLoop
                            className="overflow-y-clip"
                            transition={{
                                type: "spring",
                                stiffness: 900,
                                damping: 80,
                                mass: 10,
                            }}
                            variants={{
                                initial: { y: 20, rotateX: 90, opacity: 0, filter: "blur(4px)" },
                                animate: { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" },
                                exit: { y: -20, rotateX: -90, opacity: 0, filter: "blur(4px)" },
                            }}
                        >
                            <span>{title}</span>
                            <span>{title.replace("FILMS", "MOVIES")}</span>
                            <span>{title.replace("FILMS", "CINEMA")}</span>
                        </TextLoop>
                    </h1>
                    {component}
                </div>
            ))}
        </div>
    );
}
