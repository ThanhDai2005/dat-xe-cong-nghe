import ClientLayout from "@/components/client/ClientLayout";
import HomePage from "@/pages/client/HomePage";
import SignInPage from "@/pages/client/SignInPage";
import SignUpPage from "@/pages/client/SignUpPage";


const clientRoute = {
    path: "/",
    children: [
        {
            path: "signup",
            element: <SignUpPage />,
        },
        {
            path: "signin",
            element: <SignInPage />,
        },
        {
            element: <ClientLayout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                // {
                //     element: <PrivateRouter />,
                //     children: [

                //     ],
                // },
            ],
        },
    ],
};

export default clientRoute;
