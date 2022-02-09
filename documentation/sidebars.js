/**
 * * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
    docs: [
        {
            type: "doc",
            id: "welcome",
            label: "Welcome",
        },
        {
            type: "category",
            label: "Services",
            collapsed: false,
            items: [
                {
                    type: "category",
                    label: "Audit Trail Gateway ",
                    items: [
                        {
                            type: "doc",
                            id: "services/audit-trail-gateway/introduction",
                            label: "Introduction",
                        },
                        'services/audit-trail-gateway/API-definition',
                        'services/audit-trail-gateway/use-cases',
                    ],
                },
                {
                    type: "category",
                    label: "SSI Bridge ",
                    items: [
                        {
                            type: "doc",
                            id: "services/SSI-bridge/introduction",
                            label: "Introduction",
                        },
                        'services/SSI-bridge/API-definition',
                        'services/SSI-bridge/use-cases',
                    ],
                },
            ]
        },
        {
            type: "category",
            label: "Getting Started",
            collapsed: false,
            items: [
                "getting_started/overview",
                {
                    type: "category",
                    label: "NodeJs",
                    items: ["getting_started/installation/nodejs/local_setup"],
                },
                {
                    type: "category",
                    label: "Kubernetes",
                    items: [
                        "getting_started/installation/kubernetes/local_setup",
                        "getting_started/installation/kubernetes/configuration",
                        "getting_started/installation/kubernetes/expose_apis",
                    ],
                },
                {
                    type: "category",
                    label: "Docker Compose",
                    items: [
                        "getting_started/installation/docker_compose/docker_compose",
                        "getting_started/installation/docker_compose/expose_apis",
                    ],
                },
            ],
        },
        {
            type: "category",
            label: "Examples",
            collapsed: true,
            items: [
                "examples/introduction",
                "examples/how-to-run-examples",
                "examples/create-identity-and-credentials",
                "examples/update-users",
                "examples/delete-users",
                "examples/trusted-authorities",
                "examples/create-channel",
                "examples/authorize-to-channel",
                "examples/search-channel-and-validate-data",
            ],
        },
        {
            type: "category",
            label: "Basics",
            collapsed: true,
            items: ["basics/identity", "basics/streams"],
        },
        {
            type: "doc",
            id: "api_reference",
            label: "API Reference",
        },
        {
            type: "doc",
            id: "troubleshooting",
            label: "Troubleshooting",
        },
        {
            type: "doc",
            id: "faq",
            label: "FAQ",
        },
        {
            type: "doc",
            id: "contribute",
            label: "Contribute",
        },
        {
            type: "doc",
            id: "contact",
            label: "Contact",
        },
    ],
};
