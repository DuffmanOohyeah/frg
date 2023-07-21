# Languages

The goal of this document is to describe how we've tackled languages for the Frg project. The document is written with the assumption that you have a basic understanding of how the project works.

- NextJS
- Basic stack understanding (specifically around the server side rendering of things)

## Considerations

There were a number of things we had to take into consideration whilst designing the solution.

- Serverside rendering is a "first class concern" of the project for SEO reasons
  - We used NextJS to tackle the serverside rendering so any solution has to work with NextJS and the way "physical pages" map to "actual pages/urls" in the NextJS framework
- We are aiming for a one codebase, multiple deployment approach
  - Different deployments (brands/sites) may or may not have different language requirements
  - Where possible we should consider this multilanguage approach to be "optional". In other words the solution should be flexible in that a deployment does not neceserily have to have multilanguages and if it does, the language list can differ from any other deployment
- For SEO reasons we want each language to have it's own url "subpath"
  - It's not enough that language option can be switched to, it should be able to be served by the server in the first place

## Solution

There are a few packages which advertise integration i18n with next js but many of these packages either did not support ssr or required a change to the way our project currently worked/is structured. As such I've ended up partially rolling our own solution which is roughly outlined as:

- Use `react-i18next` to handle managing the current language of the app and to handle fetching strings in our react components
- "Patch" the NextJS router so that we can handle routes and locale subpaths during clientside navigation
- Use NextJS rewrite feature to handle locale subpaths at the url level
- Use logic in the actual app to determine if brands have specific locales. 404 if not

## The App

### Setting up react-i18next

Alot of the grunt work is done using `react-i18next` (which is a react wrapper around the `i18next` package). We have a custom object exported from `i18n/frgI18n.ts` which is mainly used in `_app.tsx` to initialise a i18next isntance to control the current language of the app. `i18next` accepts a wide variety of options at initialisation so it is probably better at this point to look at the `frgI18n.ts` file and the `i18next` [documentation](https://www.i18next.com/overview/configuration-options)

During initialisation we detect what language is to be used by looking for the query param `lang`.

### Using translations

We can then use the `useTranslation` hook in our components to get the correct strings for the currently set language.

**Before**

```
    const Component = () => {
        return <div>Blog Header</div>;
    };
```

**After**

```
    const Component = () => {
        const { t } = useTranslation();
        return <div>{t('blog_header)}</div>;
    };
```

A `LanguageChanger` component exists which offers the user languages to choose from. When a new language is changes we notify the rest of the app by calling `i18n.changeLanguage` and replace the url with the url that corresponds to the same page in the new language. Because we used the `useTranslation` hook in our components they will automatically update strings when `i18n.changeLanguage` is called.

If translated content contains components then you can use the `Trans` component from the `react-i18next` package:

**Before**

```
    const Component = () => {
        return <div>You have <Count num={10} /> job matches!</div>;
    };
```

**After**

```
    const Component = () => {
        return (
            <div>
                <Trans
                    i18nKey="jobMatchText"
                    components={{ jobCounter: <Count num={10} />}}
                />
            </div>;
        );
    };
```

Note that if you **ONLY** use the `Trans` component then strings may not update on language change as the `Trans` component is not aware of these changes.

### Routes and URLs

We want route urls to show correctly eg:

- en
  - `/`
  - `/blog`
- fr
  - `/fr`
  - `/fr/blog`

but we want them to point to the right "physical" Next JS page. eg:

- en
  - `/`
  - `/blog`
- fr
  - `/`
  - `/blog`

We do not want to create a subdirectory for each locale as we will then have to either:

- a) Duplicate all pages in multiple folders
- or
- b) Create "redirect pages" that point to correct "actual pages"

We combat this problem by creating 2 functions to correct paths and urls depending on the current language used by `i18next`.

- `i18nNextHref` adds the current language as a query parameter if it is not the default language
- `i18nNextAs` makes sure the current language subpath is appended to the front of the url

We then made custom `Link` and `useRouter` functions to replace the Next JS versions so that `i18nNextHref` and `i18nNextAs` was used across the site without us having to make any major changes to the way we currently do navigation.

## Routing

We use the NextJS Rewrite feature to handle routing from language subpathed urls to "logical" pages. More information is available [here](https://github.com/vercel/next.js/discussions/9081)

At the root of the app we check if a language is applicable and show a 404 page if the language is not supported.


## Todo list for adding a new language to a brand:

- Update `frontend/src/brands/getAdditionalLanguages.ts`
- If this is a new language altogether (across any brand) update `langOptions` in `frontend/src/i18n/frgI18n.ts`
- Add resources for the brand at `frontend/src/i18n/resources/`

Don't forget to deploy :D
