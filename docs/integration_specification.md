# Integration Specification

The goal of this document is to be the definitive description of how
the website is expected to integrate with other FRG systems.

This document should be entirely self contained (ie, should list
details in full, rather than linking to Jira tickets or other
documentation/discussion) but references tickets as context where
appropriate will be useful.

## Daxtra Search

Daxtra serves as both the messenger for delivering data to Phoenix,
and as the search engine for allowing users to find candidates and
jobs.

As one of the goals of the project is to ensure valuable data is
stored in Phoenix, the principle below is that all data about a
candidate profile gathered from a user in the website is saved to
Daxtra, with the understanding that Daxtra then loads it into
Phoenix. The website will not persist its own copy of this data, but
will rely on Daxtra as a proxy to the source-of-truth in Phoenix.

### Search jobs

Uses Daxtra Search's `search_vacancies` action. See
[https://es-demo.daxtra.com/jws/docs/?json#search-vacancies](https://es-demo.daxtra.com/jws/docs/?json#search-vacancies)

#### Input fields

| Logical name       | Field in Daxtra                          | Value                                                              | Queries                                                                                                                |
| ------------       | ---------------                          | -----                                                              | -------                                                                                                                |
| Role               | ?                                        | Multiple values                                                    |                                                                                                                        |
| Salary             | `Vacancy.StructuredOptions.Salary`       | Min and max                                                        | Need to be able to query by full time equivalent - is that what will be stored in this field?                          |
| Role Level         | `Vacancy.StructuredOptions.Level`        | Multiple values                                                    |                                                                                                                        |
| Is published?      | ?                                        | Always set to `true`                                               |                                                                                                                        |
| Job title          | `Vacancy.StructuredOptions.JobTitle`     | From keyword search                                                | What other fields in Daxtra should be targeted by keyword search?                                                      |
| Summary            | `Vacancy.StructuredOptions.Description`  | From keyword search                                                | What other fields in Daxtra should be targeted by keyword search?                                                      |
| Location           | `Vacancy.StructuredOptions.Location`     | Multiple values                                                    | Pass country name or ISO code? What about cities, identified by name alone - what about "Washington" or "Springfield"? |
| Remote             | ?                                        | From remote checkbox (either n/a or true, false)                   |                                                                                                                        |
| Security clearance | ?                                        | From Security clearance checkbox (either n/a or true, never false) |                                                                                                                        |
| Type               | `Vacancy.StructuredOptions.ContractType` | From permanent/contract/both selection ("both" becomes n/a)        | What values should we search for? "permanent" and "contract"?                                                          |
| Industry           | `Vacancy.StructuredOptions.Industry`     |                                                                    |                                                                                                                        |
| Product            | ?                                        |                                                                    |                                                                                                                        |
| Brand              | ?                                        | Fixed value based on the current website                           | Or will there be separate Daxtra instances per brand?                                                                  |

General questions:

- Rather than targeting specific fields in Daxtra with the keyword
  search, could the "Keywords" option be used? Is it safe, or will it
  search fields it shouldn't, like address or company name, and leak
  data?
- Does there also need to be a filter that is always included to
  exclude expired jobs?
- For salary, how might we handle currencies in structured data? We
  almost certainly don't want to compare between currencies, but do we
  need to be able to filter by a given currency?

Notes:

- Several of these filter fields are required to drive the different
  landing pages. See [https://frankgroup.atlassian.net/browse/NW-31](https://frankgroup.atlassian.net/browse/NW-31)
- Several of these filter fields are required such that we can provide
  the same filters as exist on the existing site, such that we can
  deliver the equivalent alerts from the new site.

#### Output fields

A list of matching jobs, from `DxResponse.Results.Result`, each with the following:

| Logical name              | Field in Daxtra | Value                                                             | Queries                                                                                                                                           |
| ------------              | --------------- | -----                                                             | -------                                                                                                                                           |
| Application email address | `User.Txt2`     | An email address to send application to - see Apply for job below |                                                                                                                                                   |
| Job title                 | `JobTitle`      |                                                                   |                                                                                                                                                   |
| Salary                    | ?               |                                                                   | Needs to be human-readable (eg "Negotiable" or "$100 per hour" or "$100000 - $120000 per annum") or we need to know how to make it human-readable |
| Location                  | ?               |                                                                   | Needs to be human-readable, or we need to know how to make it human-readable                                                                      |
| Type                      | ?               |                                                                   | What values will be returned to signify the two types? "permanent" and "contract"?                                                                |
| Date posted               | `DatePosted`    | YYYY-MM-DD date on which the job was posted                       | Or should this use the `UpdatedDate`? Or `CreatedDate`?                                                                                           |
| Summary                   | ?               |                                                                   |                                                                                                                                                   |
| Role level                | ?               |                                                                   |                                                                                                                                                   |
| Job reference number      | ?               | Displayed to users to uniquely identify a job                     |                                                                                                                                                   |
| Phoenix ID                | ?               | Used to provide a link to Phoenix to show to FRG staff            |                                                                                                                                                   |

General questions:

- The documentation shows almost no fields in the response for each
  vacancy. What fields will be returned for each vacancy in the
  results list?

### Get field options for job facets

For the following fields, need to be able to retrieve from Daxtra all
values for that field to be able to present a list (eg in a dropdown
or checkboxes) to the user for them to make a selection. We would also
need to be able to retrieve the value that we would pass back to
Daxtra to filter by (eg if the value Daxtra expects is an identifier
like `business` or `123` , but "Business / Systems Analyst" is what
the website should display to users.

Can Daxtra do this?

| Logical name | Queries                                                                                            |
| ------------ | -------                                                                                            |
| Role         |                                                                                                    |
| Location     | Also need to be able to be able to display these as a hierarchy in the right way                   |
| Role level   | Will these always be "junior" "mid-level" and "senior"? What values should be used when searching? |
| Industry     |                                                                                                    |
| Product      | Is this actually a static list (per site)?                                                         |
| Job title    |                                                                                                    |

General questions:

- Does Daxtra have a way of retrieving these?
- If there will be a shared Daxtra between all brands, how will we filter to only retrieve values for the right brand?
- How will we exclude values for unpublished jobs?
- How will we exclude values for expired jobs (if that is needed, see question regarding search inputs above)
- Both "Role" and "Job title" have ended up on this list (because
  "role" appears as a multiselect facet in the wireframes
  ([https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326071](https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326071))
  and "job title" was requested as a filter for the landing pages
  ([https://frankgroup.atlassian.net/browse/NW-31?focusedCommentId=40941&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-40941](https://frankgroup.atlassian.net/browse/NW-31?focusedCommentId=40941&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-40941)),
  but I think they really mean the same thing but are using different
  names for the field. What is the name of the field that has values
  like "Administrator" and "Architect" and "Developer"? (I think the
  answer is "role", and "job title" should be removed from this list,
  and NW-31 should say "role" instead.)

### Get job

Uses Daxtra Search's `get_vacancy` action. See
[https://es-demo.daxtra.com/jws/docs/?json#get-vacancy](https://es-demo.daxtra.com/jws/docs/?json#get-vacancy)

See wireframe here
[https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326072](https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326072)

#### Input fields

| Logical name   | Field in Daxtra     | Value | Queries |
| ------------   | ---------------     | ----- | ------- |
| Job identifier | `Vacancy.VacancyId` |       |         |

#### Output fields

| Logical name              | Field in Daxtra                          | Value                                                             | Queries                                                                                                 |
| ------------              | ---------------                          | -----                                                             | -------                                                                                                 |
| Application email address | `Vacancy.StructuredOptions.User.Txt2`    | An email address to send application to - see Apply for job below |                                                                                                         |
| Job title                 | `Vacancy.StructuredOptions.JobTitle`     |                                                                   |                                                                                                         |
| Location                  | `Vacancy.StructuredOptions.Location`     |                                                                   | What format is this in? Is it human-readable?                                                           |
| Salary                    | `Vacancy.StructuredOptions.Salary`       |                                                                   | What format is this in? Is it human-readable?                                                           |
| Type                      | `Vacancy.StructuredOptions.ContractType` |                                                                   | What values does this have? "permanent" or "contract"? Is it ever neither or something else?            |
| Product                   | ?                                        |                                                                   | The wireframe actually calls this "Technology" - am I right to think this is synonymous with "Product"? |
| Summary                   | `Vacancy.StructuredOptions.Description`  |                                                                   |                                                                                                         |
| Role Level                | `Vacancy.StructuredOptions.Level`        |                                                                   |                                                                                                         |
| Remote                    | ?                                        |                                                                   |                                                                                                         |
| Security clearance        | ?                                        |                                                                   |                                                                                                         |
| Industry                  | `Vacancy.StructuredOptions.Industry`     |                                                                   |                                                                                                         |
| Recruiter                 | ?                                        |                                                                   | What fields? Full name? Phone? Email?                                                                   |
| Job reference number      | ?                                        | Displayed to users to uniquely identify a job                     |                                                                                                         |
| Phoenix ID                | ?                                        | Used to provide a link to Phoenix to show to FRG staff            |                                                                                                         |

### Create candidate

Note that Daxtra Search will re-parse the CV, but generates different
fields to those that Daxtra Parse uses - for any field in Daxtra
Search that we do not explicitly set here, it may take a value from
its own parsing.

These fields are those that we explicitly gather from a candidate
during sign-up. Also, any data from Daxtra Parse that we want to
store, that won't be extracted by Daxtra Search's parsing will need to
be added to this list, eg skills and experience.

Note: a candidate without a CV will have a very basic one created,
based on what data we know about them.

Uses Daxtra Search's `add_candidate` action. See
[https://es-demo.daxtra.com/jws/docs/?json#add-candidate](https://es-demo.daxtra.com/jws/docs/?json#add-candidate)

See wireframes here (and subsequent pages showing sign-up process)
[https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326075](https://projects.invisionapp.com/share/BGVM7G7E7W6/401326070/comments/127199416#/screens/401326075)

#### Input fields

| Logical name                            | Field in Daxtra                             | Value                             | Queries                                   |
| ------------                            | ---------------                             | -----                             | -------                                   |
| First name                              | `Candidate.StructuredOptions.FirstName`     |                                   |                                           |
| Last name                               | `Candidate.StructuredOptions.LastName`      |                                   |                                           |
| Phone number                            | `Candidate.StructuredOptions.Contact.Phone` |                                   | Or should this target the `Mobile` field? |
| Email                                   | `Candidate.StructuredOptions.Contact.Email` |                                   |                                           |
| Seeking permanent or contract           | ?                                           | or both                           | "Filler" question during sign up          |
| Would you like to a consultant to call? | ?                                           |                                   | "Filler" question during sign up          |
| Consultant call slot                    | ?                                           | during business hours, or outside | "Filler" question during sign up          |
| CV file                                 | `Candidate.Profile`                         | Base64 encoded CV file            |                                           |

General questions

- Do we need a flag to say that the CV is one the website has
  generated for them, rather than one they have specifically uploaded?
- Based on the questions below in "Update candidate", other fields may
  be included here, so that the values can be presented to a user for
  editing.

#### Output fields

| Logical name         | Field in Daxtra         | Value                             | Queries |
| ------------         | ---------------         | -----                             | ------- |
| Candidate identifier | `Candidate.CandidateId` | Unique identifier for the candidate |         |

### Update candidate

Uses Daxtra Search's `update_candidate` action. See [https://es-demo.daxtra.com/jws/docs/?json#update-candidate](https://es-demo.daxtra.com/jws/docs/?json#update-candidate)

See wireframe here
[https://projects.invisionapp.com/share/BGVM7G7E7W6#/screens/401326105](https://projects.invisionapp.com/share/BGVM7G7E7W6#/screens/401326105) -
I've based these fields on what is shown as editable there.

#### Input fields

| Logical name          | Field in Daxtra                             | Value                               | Queries                                                                                    |
| ------------          | ---------------                             | -----                               | -------                                                                                    |
| Candidate identifier  | `Candidate.CandidateId`                     | Unique identifier for the candidate |                                                                                            |
| First name            | `Candidate.StructuredOptions.FirstName`     |                                     |                                                                                            |
| Last name             | `Candidate.StructuredOptions.LastName`      |                                     |                                                                                            |
| Phone number          | `Candidate.StructuredOptions.Contact.Phone` |                                     | Or should this target the `Mobile` field?                                                  |
| Email                 | `Candidate.StructuredOptions.Contact.Email` |                                     |                                                                                            |
| Current role          | ?                                           |                                     |                                                                                            |
| Current company       | ?                                           |                                     |                                                                                            |
| Current role location | ?                                           |                                     |                                                                                            |
| Raw executive summary | ?                                           |                                     |                                                                                            |
| Social sites          | ?                                           |                                     | Eg LinkedIn, Stackoverflow, personal site - see below                                      |
| Current status        | ?                                           |                                     | See questions below                                                                        |
| Skills                | ?                                           | List of skills                      | We discussed allowing rate or rank their skills. What makes sense when mapping to Phoenix? |
| Experience            | ?                                           | List of experience                  | See below for included fields                                                              |
| Accreditations        | ?                                           | List of accreditations              | See below for included fields                                                              |
| Education             | ?                                           | List of education history           | See below for included fields                                                              |

General questions:

- Because a user can edit themselves in Daxtra, and Daxtra is what
  employers will be searching, should a candidate be marked as
  unpublished as soon as they edit themselves? Or only if they edit
  certain fields? Depending on how we make the candidate data
  searchable (see "Search candidates") this risks leaking data.
- For the social sites, this could just be a list of relevant URLs, or
  something more structured. Depends on what would make sense once in
  Phoenix.
- For the candidate status, the wireframes show the items below as a
  list of statuses. These aren't really a list of strings, but really
  are - logically - a family of yes/no flags, or settings from some
  options, eg `readyToInterview: true` and `lookingFor: "permanent"`
  or `noticePeriod: "3months"`. I've included the logical fields these
  map to below.
    - Examples from wireframes:
        - Ready to interview and actively searching
        - Looking for a permanent role
        - Require a 3 month notice period
        - You would not relocate
        - You are interested in working remotely
        - Have the required Visas to work in the United States
    - Logical names of fields (and values) those imply (all optional):
        - Ready to Interview (true/false)
        - Looking for type (permanent/contract)
        - Notice period (1month/2month/3month - other?)
        - Willing to relocate (true/false)
        - Interested in remote (true/false)
        - Have right to work in Countries (list of countries?)
- For experience, the wireframes show each experience item as having
  the fields as defined below. Again, we should aim for what makes
  sense when maps to Phoenix.
    - Job title
    - Company
    - Location
    - Type of work (selected from a dropdown)
    - Is current job? (y/n)
    - Start date (MM-YYYY)
    - End date (MM-YYYY)
    - Skills (a list)
    - Summary of achievements
- For accreditations, this probably depends on what would map to Phoenix.
- For education history, this probably depends on what would map to
  Phoenix. The wireframes suggest the following:
    - Institution name
    - Title of studies completed
    - Year (YYYY)
- For many of the above, we may want to present users with dropdowns
  of values, rather than (or in addition to) free text, eg for skills,
  or accreditations. If so, we would need to be able to retrieve the
  values to display from somewhere.

#### Output fields

None

### Get candidate (to display to themselves)

Uses Daxtra Search's `get_candidate` action. See
[https://es-demo.daxtra.com/jws/docs/?json#get-candidate](https://es-demo.daxtra.com/jws/docs/?json#get-candidate)

#### Input fields

| Logical name         | Field in Daxtra         | Value | Queries |
| ------------         | ---------------         | ----- | ------- |
| Candidate identifier | `Candidate.CandidateId` |       |         |

#### Output fields

Same as those required as inputs for "Update candidate", as we need to
be able to present the existing data to candidates for them to update.

### Search candidates

#### Input fields

| Logical name               | Field in Daxtra                                               | Value                                                       | Queries                                                                                              |
| ------------               | ---------------                                               | -----                                                       | -------                                                                                              |
| Skills                     | ?                                                             | Multiple values                                             |                                                                                                      |
| Salary                     | `Candidate.StructuredOptions.Employment.Desired.Salary`       | Min and max (note, targets desired, not current)            |                                                                                                      |
| Level                      | ?                                                             |                                                             |                                                                                                      |
| Is published?              | ?                                                             | Always set to true                                          |                                                                                                      |
| Location                   | ?                                                             |                                                             | The existing site has Country and Region. The hierarchy is quite different to the one for Job search |
| Job title                  | `Candidate.StructuredOptions.Employment.Current.Title`        | From keyword search                                         | What other fields in Daxtra should be targeted by keyword search?                                    |
| Cleaned Executive Summary  | ?                                                             | From keyword search                                         | What other fields in Daxtra should be targeted by keyword search?                                    |
| Years experience           | `Candidate.StructuredOptions.Employment.YearsExperience`      | From minimum years experience                               |                                                                                                      |
| Language                   | ?                                                             |                                                             |                                                                                                      |
| Type                       | `Candidate.StructuredOptions.Employment.Desired.ContractType` | From permanent/contract/both selection ("both" becomes n/a) | What values should we search for? "permanent" and "contract"?                                        |
| Company experience         | ?                                                             | Multiple values                                             |                                                                                                      |
| Industry experience        | ?                                                             | Multiple values                                             |                                                                                                      |
| Availability               | ?                                                             | Multiple values                                             | There is an "AvailableDate", but that doesn't match with the existing filter options                 |
| Willing to relocate?       | ?                                                             | Yes/no                                                      |                                                                                                      |
| Brand                      | ?                                                             | Fixed value based on the current website                    |                                                                                                      |

General questions:

- Rather than targeting specific fields in Daxtra with the keyword
  search, could the "Keywords" option be used? Is it safe, or will it
  search fields it shouldn't, like address or company name, and leak
  data?
    - If we allow a user to set their current job title as free-text
      (or do so implicitly by parsing from the CV) then we risk
      leaking un-cleaned data here.
- For location, what fields should be considered "safe" to query?
    - Country and City are safe? Postcode, Latitude and Longitude are not safe?
    - How will we turn values from the hierarchy into allowed values to query?
- For salary, how might we handle currencies in the structured data?
  We almost certainly don't want to compare between currencies, but do
  we need to be able to filter by a given currency? There are records
  in the existing site where the salary is in USD, but the location is
  United Kingdom.
- Also for salary, as the site has "from", "upto", "currency" and "pay
  frequency", we would either need to be able to map these when
  migrating alerts, or support these search facets here.

#### Output fields

| Logical name               | Field in Daxtra            | Value                                                                  | Queries                                                                                                                                           |
| ------------               | ---------------            | -----                                                                  | -------                                                                                                                                           |
| Current job title          | `Employment.Current.Title` | Used as the "title" of the candidate, eg "Senior ServiceNow Developer" |                                                                                                                                                   |
| Date posted                | `CreatedDate`              | YYYY-MM-DD date on which the job was posted                            | Or should this use the `UpdatedDate`?                                                                                                             |
| Location                   | ?                          |                                                                        | Needs to be human-readable, or we need to know how to make it human-readable, without leaking data                                                |
| Salary                     | ?                          |                                                                        | Needs to be human-readable (eg "Negotiable" or "$100 per hour" or "$100000 - $120000 per annum") or we need to know how to make it human-readable |
| Years experience           | ?                          |                                                                        |                                                                                                                                                   |
| Availability               | ?                          |                                                                        |                                                                                                                                                   |
| Skills                     | ?                          | List of skills                                                         |                                                                                                                                                   |
| Accreditations             | ?                          |                                                                        |                                                                                                                                                   |
| Candidate reference number | ?                          | Displayed to users to uniquely identify a candidate                    | Use `CandidateId`? Or something else?                                                                                                             |
| Phoenix ID                 | ?                          | Used to provide a link to Phoenix to show to FRG staff                 |                                                                                                                                                   |
|                            |                            |                                                                        |                                                                                                                                                   |

### Get field options for candidate facets

For the following fields, need to be able to retrieve from Daxtra all
values for that field to be able to present a list (eg in a dropdown
or checkboxes) to the user for them to make a selection. We would also
need to be able to retrieve the value that we would pass back to
Daxtra to filter by (eg if the value Daxtra expects is an identifier
like `business` or `123` , but "Business / Systems Analyst" is what
the website should display to users.

Can Daxtra do this?

| Logical name        | Queries                                                                                            |
| ------------        | -------                                                                                            |
| Skills              |                                                                                                    |
| Location            | Also need to be able to be able to display these as a hierarchy in the right way                   |
| Role level          | Will these always be "junior" "mid-level" and "senior"? What values should be used when searching? |
| Industry experience |                                                                                                    |
| Product             | Is this actually a static list (per site)?                                                         |
| Language            |                                                                                                    |
| Company experience  |                                                                                                    |
| Availability        | Is this actually a static list?                                                                    |

General questions:

- Does Daxtra have a way of retrieving these?
- If there will be a shared Daxtra between all brands, how will we filter to only retrieve values for the right brand?
- How will we exclude values for unpublished candidates?

### Get candidate (to display to employers)

Uses Daxtra Search's `get_candidate` action. See
[https://es-demo.daxtra.com/jws/docs/?json#get-candidate](https://es-demo.daxtra.com/jws/docs/?json#get-candidate)

See wireframe here
[https://projects.invisionapp.com/share/4EVM7C2NFUQ/401326940/comments/127084556#/screens/401326939](https://projects.invisionapp.com/share/4EVM7C2NFUQ/401326940/comments/127084556#/screens/401326939)

#### Input fields

| Logical name         | Field in Daxtra         | Value | Queries |
| ------------         | ---------------         | ----- | ------- |
| Candidate identifier | `Candidate.CandidateId` |       |         |

#### Output fields

| Logical name               | Field in Daxtra                                          | Value                                                                                            | Queries                                                     |
| ------------               | ---------------                                          | -----                                                                                            | -------                                                     |
| Current role               | `Candidate.StructuredOptions.Employment.Current.Title`   |                                                                                                  | Is this safe to display?                                    |
| Current role location      | ?                                                        |                                                                                                  | City and Country from address?                              |
| Cleaned executive summary  | ?                                                        | Raw summary from user is "cleaned" (or completely new summary written) by a recruiter in Phoenix |                                                             |
| Current status             | ?                                                        | Eg "ready to interview" or "notice period: 1 month"                                              | See queries about candidate status under "Update candidate" |
| Skills                     | ?                                                        | List of skills                                                                                   | Show all skills? And scores?                                |
| Accreditations             | ?                                                        | List of accreditations                                                                           |                                                             |
| Education                  | ?                                                        | List of education history                                                                        |                                                             |
| Years experience           | `Candidate.StructuredOptions.Employment.YearsExperience` |                                                                                                  |                                                             |
| Company experience         | ?                                                        |                                                                                                  |                                                             |
| Industry experience        | ?                                                        |                                                                                                  |                                                             |
| Additional notes           | ?                                                        |                                                                                                  | Notes from the recruiter about the candidate to display     |
| Candidate reference number | ?                                                        | Displayed to users to uniquely identify a candidate                                              | Use `CandidateId`?                                          |
| Phoenix ID                 | ?                                                        | Used to provide a link to Phoenix to show to FRG staff                                           |                                                             |

### Match candidate to jobs

#### Input fields

| Logical name         | Field in Daxtra         | Value                                                                           | Queries |
| ------------         | ---------------         | -----                                                                           | ------- |
| Candidate identifier | `Candidate.CandidateId` | When creating a candidate in Daxtra, we get that user's identifier for use here |         |

General questions:

- Even though - in abstract - just matching to the candidate
  identifier is enough, we will want to specify extra things here.
    - What other fields (from those we have for the candidate)?
- Will proximity search leak data here?
    - This depends on what location data is editable for a user in
      their profile, and how this is used when matching for
      jobs. Could a sufficiently determined user keep updating their
      address in their profile and see how the best matches change to
      determine the location of job postings?

#### Output fields

Same fields as returned by "Search jobs"

### Match job to job

Uses Daxtra Search's `match_vacancy_to_vacancies` action. See
[https://es-demo.daxtra.com/jws/docs/?json#match-vacancy-to-vacancies](https://es-demo.daxtra.com/jws/docs/?json#match-vacancy-to-vacancies)

This is used on a job listing page where the job has expired. Will an
expired job remain in Daxtra for a period after expiry, but flagged as
expired? That way the "sorry, job expired" page could find the job,
notice that it is expired, and so show similar jobs instead.

If expired jobs will be removed from Daxtra as soon as they expire,
this will need to be revisited.

#### Input fields

| Logical name   | Field in Daxtra     | Value                              | Queries |
| ------------   | ---------------     | -----                              | ------- |
| Job identifier | `Vacancy.VacancyId` | The identifiier of the expired job |         |

- Even though - in abstract - just matching to the job
  identifier is enough, we will want to specify extra things here.
    - What other fields (from those we have for the job)?

#### Output fields

Same fields as returned by "Search jobs"

## Daxtra Parse

### Parse CV

Note that this is "stateless" in that all that Daxtra Parse does is CV
in, structured data out - it doesn't maintain a record of CV (that
happens in Daxtra Search).

This is the available structured data from parsing the CV. The goal
would be that we this data is parsed and made available to a candidate
user in their profile for them to update (see "Update
candidate"). Depending on the decisions around the structure of the
data for the "Update candidate" section, we will need to understand
how to push data from some of these fields into "Create candidate",
such that it is returned by "Get candidate" and editable using "Update
candidate".

| Field from Daxtra Parse                                            | Type                                                                                |
| -----------------------                                            | ----                                                                                |
| `StructuredResume.ContactMethod.InternetEmailAddress_main`         | string                                                                              |
| `StructuredResume.ContactMethod.PostalAddress_main.PostalCode`     | string                                                                              |
| `StructuredResume.ContactMethod.PostalAddress_main.AddressLine`    | string                                                                              |
| `StructuredResume.ContactMethod.PostalAddress_main.Municipality`   | string                                                                              |
| `StructuredResume.ContactMethod.PostalAddress_main.CountryCode`    | string (2-letter code)                                                              |
| `StructuredResume.ContactMethod.Telephone_home`                    | string (phone number)                                                               |
| `StructuredResume.ContactMethod.Telephone_mobile`                  | string (phone number)                                                               |
| `StructuredResume.PersonName.FormattedName`                        | string                                                                              |
| `StructuredResume.PersonName.FamilyName`                           | string                                                                              |
| `StructuredResume.PersonName.GivenName`                            | string                                                                              |
| `StructuredResume.PersonName.MiddleName`                           | [string]                                                                            |
| `StructuredResume.PersonName.sex`                                  | string ("Male" or "Female")                                                         |
| `StructuredResume.PlaceOfBirth.Municipality`                       | string                                                                              |
| `StructuredResume.PlaceOfBirth.CountryCode`                        | string (2-letter code)                                                              |
| `StructuredResume.lang`                                            | string (2-letter code)                                                              |
| `StructuredResume.Nationality`                                     | [string] (2-letter codes)                                                           |
| `StructuredResume.Competency[].auth`                               | boolean                                                                             |
| `StructuredResume.Competency[].skillLevel`                         | integer                                                                             |
| `StructuredResume.Competency[].skillName`                          | string                                                                              |
| `StructuredResume.Competency[].skillCount`                         | integer                                                                             |
| `StructuredResume.Competency[].TaxonomyId.idOwner`                 | string (eg "DAXTRA", possibly other values)                                         |
| `StructuredResume.Competency[].TaxonomyId.description`             | string (eg "procurement > misc-mb", possibly other values)                          |
| `StructuredResume.Competency[].description`                        | string (eg "Skill", possibly other values)                                          |
| `StructuredResume.Competency[].skillAliasArray`                    | [string]                                                                            |
| `StructuredResume.Competency[].Grade`                              | string                                                                              |
| `StructuredResume.DOB`                                             | string (date in ISO format)                                                         |
| `StructuredResume.EducationHistory[].SchoolUnit`                   | string (eg "International University", possibly other values)                       |
| `StructuredResume.EducationHistory[].schoolType`                   | string (eg "university", possibly other values)                                     |
| `StructuredResume.EducationHistory[].SchoolName`                   | string                                                                              |
| `StructuredResume.EducationHistory[].Degree.degreeType`            | string (eg "doctorate", possibly other values)                                      |
| `StructuredResume.EducationHistory[].Degree.DegreeName`            | string                                                                              |
| `StructuredResume.EducationHistory[].Degree.DegreeDate`            | string (YYYY-MM, possibly other formats)                                            |
| `StructuredResume.EducationHistory[].Comments`                     | string                                                                              |
| `StructuredResume.EducationHistory[].LocationSummary.Municipality` | string                                                                              |
| `StructuredResume.EducationHistory[].LocationSummary.CountryCode`  | string (2-letter code)                                                              |
| `StructuredResume.EducationHistory[].StartDate`                    | string (YYYY-MM, possibly other formats)                                            |
| `StructuredResume.EducationHistory[].EndDate`                      | string (YYYY-MM, possibly other formats)                                            |
| `StructuredResume.EducationHistory[].Major`                        | string                                                                              |
| `StructuredResume.EducationHistory[].MeasureValue`                 | string                                                                              |
| `StructuredResume.EmploymentHistory[].employerOrgType`             | string                                                                              |
| `StructuredResume.EmploymentHistory[].EndDate`                     | string                                                                              |
| `StructuredResume.EmploymentHistory[].MonthsOfWork`                | integer                                                                             |
| `StructuredResume.EmploymentHistory[].EmployerOrgName`             | string                                                                              |
| `StructuredResume.EmploymentHistory[].Title`                       | [string]                                                                            |
| `StructuredResume.EmploymentHistory[].OrgName`                     | string                                                                              |
| `StructuredResume.EmploymentHistory[].PositionType`                | string                                                                              |
| `StructuredResume.EmploymentHistory[].JobArea`                     | string                                                                              |
| `StructuredResume.EmploymentHistory[].JobGrade`                    | string                                                                              |
| `StructuredResume.EmploymentHistory[].StartDate`                   | string (YYYY, possibly other formats)                                               |
| `StructuredResume.EmploymentHistory[].Description`                 | string                                                                              |
| `StructuredResume.MaritalStatus`                                   | string (eg "SINGLE", possibly other values)                                         |
| `src`                                                              | string (information about the parser engine)                                        |
| `ExperienceSummary.ExecutiveBrief`                                 | string                                                                              |
| `ExperienceSummary.TotalYearsOfManagementWorkExperience`           | integer                                                                             |
| `ExperienceSummary.TotalYearsOfLowLevelManagementWorkExperience`   | integer                                                                             |
| `ExperienceSummary.TotalMonthsOfWorkExperience`                    | integer                                                                             |
| `ExperienceSummary.TotalMonthsOfLowLevelManagementWorkExperience`  | integer                                                                             |
| `ExperienceSummary.TotalMonthsOfManagementWorkExperience`          | integer                                                                             |
| `ExperienceSummary.TotalYearsOfWorkExperience`                     | integer                                                                             |
| `ExperienceSummary.ManagementRecord`                               | string                                                                              |
| `ExperienceSummary.HighestEducationalLevel`                        | string (eg "doctorate", possibly other values)                                      |
| `FileStruct`                                                       | object (information about the parsed file, almost certainly not interesting)        |
| `TextResume`                                                       | string (a text-only representation of the CV)                                       |
| `ParserInfo`                                                       | object (more information about the parser engine, almost certainly not interesting) |

## Pardot form handlers

### Candidate register

See [https://frankgroup.atlassian.net/browse/NW-5](https://frankgroup.atlassian.net/browse/NW-5) for context

| Logical name     | Field in Pardot | Type    | Notes                                          |
| ------------     | -----           | ----    | -----                                          |
| First name       | `first_name`    | string  |                                                |
| Last name        | `last_name`     | string  |                                                |
| Email            | `email`         | string  |                                                |
| Brand            | `brand`         | string  | hidden field, based on website, see list below |
| Marketing opt-in | `opt_in`        | boolean |                                                |
| Job title        | `job_title`     | string  |                                                |

### Employer register

See [https://frankgroup.atlassian.net/browse/NW-18](https://frankgroup.atlassian.net/browse/NW-18) for context

| Logical name     | Field in Pardot | Type    | Notes                                          |
| ------------     | -----           | ----    | -----                                          |
| First name       | `first_name`    | string  |                                                |
| Last name        | `last_name`     | string  |                                                |
| Email            | `email`         | string  |                                                |
| Company          | `company`       | string  |                                                |
| Telephone        | `telephone`     | string  |                                                |
| Brand            | `brand`         | string  | hidden field, based on website, see list below |
| Country          | `country`       | string  | hidden field, geo located, see list below      |
| Marketing opt-in | `opt_in`        | boolean |                                                |
| Source           | `source`        | string  | hidden field, taken from referrer              |

### Employer requesting a callback (generic)

Context: triggered by the generic request a callback form. Is
triggered alongside the related email.

| Logical name       | Field in Pardot                                      | Type    | Notes                                                        |
| ------------       | -----                                                | ----    | -----                                                        |
| First name         | `first_name`                                         | string  |                                                              |
| Last name          | `last_name`                                          | string  |                                                              |
| Email              | `email`                                              | string  | email address                                                |
| Company            | `company`                                            | string  |                                                              |
| Telephone          | `telephone`                                          | string  | telephone number                                             |
| Comments           | `comments`                                           | string  |                                                              |
| Is urgent?         | `Candidate_Search_Request_Candidate_Callback_Urgent` | boolean |                                                              |
| Brand              | `brand`                                              | string  | hidden field, based on website, see list below               |
| Country            | `country`                                            | string  | hidden field, geo located, see list below                    |
| Marketing opt-in   | `opt_in`                                             | boolean |                                                              |
| Source             | `source`                                             | string  | hidden field, taken from referrer                            |
| Job spec indicator | `jobspec_indicator`                                  | boolean | hidden field, indicates whether a job spec file was included |

Note: the job spec file itself is not included, as Pardot cannot receive file uploads.

### Employer requesting a callback about a candidate

Context: triggered by the request a callback about a candidate
form. Is triggered alongside the related email.

| Logical name     | Field in Pardot                                      | Type    | Notes                                          |
| ------------     | -----                                                | ----    | -----                                          |
| First name       | `first_name`                                         | string  |                                                |
| Last name        | `last_name`                                          | string  |                                                |
| Email            | `email`                                              | string  | email address                                  |
| Company          | `company`                                            | string  |                                                |
| Telephone        | `telephone`                                          | string  | telephone number                               |
| Comments         | `comments`                                           | string  |                                                |
| Is urgent?       | `Candidate_Search_Request_Candidate_Callback_Urgent` | boolean |                                                |
| Profile ID       | `profile_id`                                         | string  | Phoenix ID                                     |
| Brand            | `brand`                                              | string  | hidden field, based on website, see list below |
| Country          | `country`                                            | string  | hidden field, geo located, see list below      |
| Marketing opt-in | `opt_in`                                             | boolean |                                                |
| Source           | `source`                                             | string  | hidden field, taken from referrer              |

### Employer requesting a callback about a shortlist of candidates

Context: triggered by the request a callback about a shortlist of
candidates form. Is triggered alongside the related email.

| Logical name     | Field in Pardot                                      | Type    | Notes                                          |
| ------------     | -----                                                | ----    | -----                                          |
| First name       | `first_name`                                         | string  |                                                |
| Last name        | `last_name`                                          | string  |                                                |
| Email            | `email`                                              | string  | email address                                  |
| Company          | `company`                                            | string  |                                                |
| Telephone        | `telephone`                                          | string  | telephone number                               |
| Comments         | `comments`                                           | string  |                                                |
| Is urgent?       | `Candidate_Search_Request_Candidate_Callback_Urgent` | boolean |                                                |
| Profile ID       | `profile_id`                                         | string  | Phoenix ID, comma separated                    |
| Brand            | `brand`                                              | string  | hidden field, based on website, see list below |
| Country          | `country`                                            | string  | hidden field, geo located, see list below      |
| Marketing opt-in | `opt_in`                                             | boolean |                                                |
| Source           | `source`                                             | string  | hidden field, taken from referrer              |

### Options for fields

#### Brand

The "Brand" field above should be populated with one of the following values, depending on the site:

| website                         | value      |
| -------                         | -----      |
| https://www.andersonfrank.com   | `AFI`      |
| unused                          | `CFI`      |
| unused                          | `FRG Tech` |
| https://www.jeffersonfrank.com  | `JFI`      |
| https://www.masonfrank.com      | `MFI`      |
| https://www.nelsonfrank.com     | `NEL`      |
| https://www.nigelfrank.com      | `NFI`      |
| unused                          | `PFI`      |
| https://www.washingtonfrank.com | `WFI`      |

#### Country

The "Country" field above should be populated with the country name,
depending on the country that a user is accessing the site
from. Geolocation will give the two-letter ISO code, and we will map
this given below (see [https://frankgroup.atlassian.net/browse/NW-18](https://frankgroup.atlassian.net/browse/NW-18)
for context).

If the resolved country code does not appear in the list below, or
geolocation is unable to resolve to a country, then the country field
will be empty.

| ISO code | Country name                                 |
| -------- | ------------                                 |
| `AD`     | Andorra                                      |
| `AE`     | United Arab Emirates                         |
| `AF`     | Afghanistan                                  |
| `AG`     | Antigua and Barbuda                          |
| `AI`     | Anguilla                                     |
| `AL`     | Albania                                      |
| `AM`     | Armenia                                      |
| `AO`     | Angola                                       |
| `AQ`     | Antarctica                                   |
| `AR`     | Argentina                                    |
| `AT`     | Austria                                      |
| `AU`     | Australia                                    |
| `AW`     | Aruba                                        |
| `AX`     | Aland Islands                                |
| `AZ`     | Azerbaijan                                   |
| `BA`     | Bosnia and Herzegovina                       |
| `BB`     | Barbados                                     |
| `BD`     | Bangladesh                                   |
| `BE`     | Belgium                                      |
| `BF`     | Burkina Faso                                 |
| `BG`     | Bulgaria                                     |
| `BH`     | Bahrain                                      |
| `BI`     | Burundi                                      |
| `BJ`     | Benin                                        |
| `BL`     | Saint Barthélemy                             |
| `BM`     | Bermuda                                      |
| `BN`     | Brunei Darussalam                            |
| `BO`     | Bolivia, Plurinational State of              |
| `BQ`     | Bonaire, Sint Eustatius and Saba             |
| `BR`     | Brazil                                       |
| `BS`     | Bahamas                                      |
| `BT`     | Bhutan                                       |
| `BV`     | Bouvet Island                                |
| `BW`     | Botswana                                     |
| `BY`     | Belarus                                      |
| `BZ`     | Belize                                       |
| `CA`     | Canada                                       |
| `CC`     | Cocos (Keeling) Islands                      |
| `CD`     | Congo, the Democratic Republic of the        |
| `CF`     | Central African Republic                     |
| `CG`     | Congo                                        |
| `CH`     | Switzerland                                  |
| `CI`     | Cote d'Ivoire                                |
| `CK`     | Cook Islands                                 |
| `CL`     | Chile                                        |
| `CM`     | Cameroon                                     |
| `CN`     | China                                        |
| `CO`     | Colombia                                     |
| `CR`     | Costa Rica                                   |
| `CU`     | Cuba                                         |
| `CV`     | Cape Verde                                   |
| `CW`     | Curaçao                                      |
| `CX`     | Christmas Island                             |
| `CY`     | Cyprus                                       |
| `CZ`     | Czech Republic                               |
| `DE`     | Germany                                      |
| `DJ`     | Djibouti                                     |
| `DK`     | Denmark                                      |
| `DM`     | Dominica                                     |
| `DO`     | Dominican Republic                           |
| `DZ`     | Algeria                                      |
| `EC`     | Ecuador                                      |
| `EE`     | Estonia                                      |
| `EG`     | Egypt                                        |
| `EH`     | Western Sahara                               |
| `ER`     | Eritrea                                      |
| `ES`     | Spain                                        |
| `ET`     | Ethiopia                                     |
| `FI`     | Finland                                      |
| `FJ`     | Fiji                                         |
| `FK`     | Falkland Islands (Malvinas)                  |
| `FO`     | Faroe Islands                                |
| `FR`     | France                                       |
| `GA`     | Gabon                                        |
| `GB`     | United Kingdom                               |
| `GD`     | Grenada                                      |
| `GE`     | Georgia                                      |
| `GF`     | French Guiana                                |
| `GG`     | Guernsey                                     |
| `GH`     | Ghana                                        |
| `GI`     | Gibraltar                                    |
| `GL`     | Greenland                                    |
| `GM`     | Gambia                                       |
| `GN`     | Guinea                                       |
| `GP`     | Guadeloupe                                   |
| `GQ`     | Equatorial Guinea                            |
| `GR`     | Greece                                       |
| `GS`     | South Georgia and the South Sandwich Islands |
| `GT`     | Guatemala                                    |
| `GW`     | Guinea-Bissau                                |
| `GY`     | Guyana                                       |
| `HK`     | Hong Kong                                    |
| `HM`     | Heard Island and McDonald Islands            |
| `HN`     | Honduras                                     |
| `HR`     | Croatia                                      |
| `HT`     | Haiti                                        |
| `HU`     | Hungary                                      |
| `ID`     | Indonesia                                    |
| `IE`     | Ireland                                      |
| `IL`     | Israel                                       |
| `IM`     | Isle of Man                                  |
| `IN`     | India                                        |
| `IO`     | British Indian Ocean Territory               |
| `IQ`     | Iraq                                         |
| `IR`     | Iran, Islamic Republic of                    |
| `IS`     | Iceland                                      |
| `IT`     | Italy                                        |
| `JE`     | Jersey                                       |
| `JM`     | Jamaica                                      |
| `JO`     | Jordan                                       |
| `JP`     | Japan                                        |
| `KE`     | Kenya                                        |
| `KG`     | Kyrgyzstan                                   |
| `KH`     | Cambodia                                     |
| `KI`     | Kiribati                                     |
| `KM`     | Comoros                                      |
| `KN`     | Saint Kitts and Nevis                        |
| `KP`     | Korea, Democratic People's Republic of       |
| `KR`     | Korea, Republic of                           |
| `KW`     | Kuwait                                       |
| `KY`     | Cayman Islands                               |
| `KZ`     | Kazakhstan                                   |
| `LA`     | Lao People's Democratic Republic             |
| `LB`     | Lebanon                                      |
| `LC`     | Saint Lucia                                  |
| `LI`     | Liechtenstein                                |
| `LK`     | Sri Lanka                                    |
| `LR`     | Liberia                                      |
| `LS`     | Lesotho                                      |
| `LT`     | Lithuania                                    |
| `LU`     | Luxembourg                                   |
| `LV`     | Latvia                                       |
| `LY`     | Libyan Arab Jamahiriya                       |
| `MA`     | Morocco                                      |
| `MC`     | Monaco                                       |
| `MD`     | Moldova, Republic of                         |
| `ME`     | Montenegro                                   |
| `MF`     | Saint Martin (French part)                   |
| `MG`     | Madagascar                                   |
| `MK`     | Macedonia, the former Yugoslav Republic of   |
| `ML`     | Mali                                         |
| `MM`     | Myanmar                                      |
| `MN`     | Mongolia                                     |
| `MO`     | Macao                                        |
| `MQ`     | Martinique                                   |
| `MR`     | Mauritania                                   |
| `MS`     | Montserrat                                   |
| `MT`     | Malta                                        |
| `MU`     | Mauritius                                    |
| `MV`     | Maldives                                     |
| `MW`     | Malawi                                       |
| `MX`     | Mexico                                       |
| `MY`     | Malaysia                                     |
| `MZ`     | Mozambique                                   |
| `NA`     | Namibia                                      |
| `NC`     | New Caledonia                                |
| `NE`     | Niger                                        |
| `NF`     | Norfolk Island                               |
| `NG`     | Nigeria                                      |
| `NI`     | Nicaragua                                    |
| `NL`     | Netherlands                                  |
| `NO`     | Norway                                       |
| `NP`     | Nepal                                        |
| `NR`     | Nauru                                        |
| `NU`     | Niue                                         |
| `NZ`     | New Zealand                                  |
| `OM`     | Oman                                         |
| `PA`     | Panama                                       |
| `PE`     | Peru                                         |
| `PF`     | French Polynesia                             |
| `PG`     | Papua New Guinea                             |
| `PH`     | Philippines                                  |
| `PK`     | Pakistan                                     |
| `PL`     | Poland                                       |
| `PM`     | Saint Pierre and Miquelon                    |
| `PN`     | Pitcairn                                     |
| `PS`     | Palestinian Territory, Occupied              |
| `PT`     | Portugal                                     |
| `PY`     | Paraguay                                     |
| `QA`     | Qatar                                        |
| `RE`     | Reunion                                      |
| `RO`     | Romania                                      |
| `RS`     | Serbia                                       |
| `RU`     | Russian Federation                           |
| `RW`     | Rwanda                                       |
| `SA`     | Saudi Arabia                                 |
| `SB`     | Solomon Islands                              |
| `SC`     | Seychelles                                   |
| `SD`     | Sudan                                        |
| `SE`     | Sweden                                       |
| `SG`     | Singapore                                    |
| `SH`     | Saint Helena, Ascension and Tristan da Cunha |
| `SI`     | Slovenia                                     |
| `SJ`     | Svalbard and Jan Mayen                       |
| `SK`     | Slovakia                                     |
| `SL`     | Sierra Leone                                 |
| `SM`     | San Marino                                   |
| `SN`     | Senegal                                      |
| `SO`     | Somalia                                      |
| `SR`     | Suriname                                     |
| `SS`     | South Sudan                                  |
| `ST`     | Sao Tome and Principe                        |
| `SV`     | El Salvador                                  |
| `SX`     | Sint Maarten (Dutch part)                    |
| `SY`     | Syrian Arab Republic                         |
| `SZ`     | Swaziland                                    |
| `TC`     | Turks and Caicos Islands                     |
| `TD`     | Chad                                         |
| `TF`     | French Southern Territories                  |
| `TG`     | Togo                                         |
| `TH`     | Thailand                                     |
| `TJ`     | Tajikistan                                   |
| `TK`     | Tokelau                                      |
| `TL`     | Timor-Leste                                  |
| `TM`     | Turkmenistan                                 |
| `TN`     | Tunisia                                      |
| `TO`     | Tonga                                        |
| `TR`     | Turkey                                       |
| `TT`     | Trinidad and Tobago                          |
| `TV`     | Tuvalu                                       |
| `TW`     | Chinese Taipei                               |
| `TZ`     | Tanzania, United Republic of                 |
| `UA`     | Ukraine                                      |
| `UG`     | Uganda                                       |
| `US`     | United States                                |
| `UY`     | Uruguay                                      |
| `UZ`     | Uzbekistan                                   |
| `VA`     | Holy See (Vatican City State)                |
| `VC`     | Saint Vincent and the Grenadines             |
| `VE`     | Venezuela, Bolivarian Republic of            |
| `VG`     | Virgin Islands, British                      |
| `VN`     | Viet Nam                                     |
| `VU`     | Vanuatu                                      |
| `WF`     | Wallis and Futuna                            |
| `WS`     | Samoa                                        |
| `YE`     | Yemen                                        |
| `YT`     | Mayotte                                      |
| `ZA`     | South Africa                                 |
| `ZM`     | Zambia                                       |
| `ZW`     | Zimbabwe                                     |

## Emails

Note that for these, the body will be generated as:

```
Field name: field value
Another field name: another field value
```

Note that for all of these, there's a outstanding question about what
email(s) they should each be sent to (unless the target address, or
logic for finding the target address, is noted here). If the email(s)
are fixed for each email, this is just configuration which is
straightforward. If there is logic to determine the address (eg, "if
they are searching for X then email this address" or "if the user is
geolocated to this country then email this address") this needs to be
understood.

### Apply for job

A vacancy in Daxtra has a `Txt2` field determining the email address to which
an application is sent.

See [https://frankgroup.atlassian.net/browse/NW-14](https://frankgroup.atlassian.net/browse/NW-14)

#### Body

| Field        | Type   | Notes                        |
| -----        | ----   | -----                        |
| Name         | string | Applicant full name          |
| Phoenix Link | string | Link to candidate in Phoenix |

General questions:

- Are there other fields that are important to put in the email body?

#### Attachment

The user's CV (retrieved from Daxtra Search).

### Inbounders team

#### Employer requesting a callback (generic)

Context: triggered by the generic request a callback form. Is
triggered alongside the related Pardot form.

##### Body

| Field            | Type    | Notes                                          |
| -----            | ----    | -----                                          |
| First name       | string  |                                                |
| Last name        | string  |                                                |
| Email            | string  | email address                                  |
| Company          | string  |                                                |
| Telephone        | string  | telephone number                               |
| Comments         | string  |                                                |
| Is urgent?       | boolean |                                                |
| Brand            | string  | hidden field, based on website, see list below |
| Country          | string  | hidden field, geo located, see list below      |
| Marketing opt-in | boolean |                                                |
| Source           | string  | hidden field, taken from referrer              |

##### Attachment

Job spec file

#### Employer requesting a callback about a candidate

Context: triggered by the request a callback about a candidate form. Is
triggered alongside the related Pardot form.

##### Body

| Field            | Type    | Notes                                          |
| -----            | ----    | -----                                          |
| First name       | string  |                                                |
| Last name        | string  |                                                |
| Email            | string  | email address                                  |
| Company          | string  |                                                |
| Telephone        | string  | telephone number                               |
| Comments         | string  |                                                |
| Is urgent?       | boolean |                                                |
| Profile ID       | string  | Candidate Phoenix ID                           |
| Brand            | string  | hidden field, based on website, see list below |
| Country          | string  | hidden field, geo located, see list below      |
| Marketing opt-in | boolean |                                                |
| Source           | string  | hidden field, taken from referrer              |

#### Employer requesting a callback about a shortlist of candidates

Context: triggered by the request a callback about a shortlist of candidates
form. Is triggered alongside the related Pardot form.

##### Body

| Field            | Type          | Notes                                          |
| -----            | ----          | -----                                          |
| First name       | string        |                                                |
| Last name        | string        |                                                |
| Email            | string        | email address                                  |
| Company          | string        |                                                |
| Telephone        | string        | telephone number                               |
| Comments         | string        |                                                |
| Is urgent?       | boolean       | displayed as "yes" or "no"                     |
| Profiles         | list of links | list of links to candidates in Phoenix         |
| Brand            | string        | hidden field, based on website, see list below |
| Country          | string        | hidden field, geo located, see list below      |
| Marketing opt-in | boolean       | displayed as "yes" or "no"                     |
| Source           | string        | hidden field, taken from referrer              |

#### Automated failure, too low score

Pending details, see [https://frankgroup.atlassian.net/browse/NW-16](https://frankgroup.atlassian.net/browse/NW-16)

##### Body

| Field      | Type   | Notes |
| -----      | ----   | ----- |
| First name | string |       |
| Last name  | string |       |

##### Attachment

Uploaded CV

### Additional emails

Note that
[https://frankgroup.atlassian.net/browse/NW-28?focusedCommentId=39596&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-39596](https://frankgroup.atlassian.net/browse/NW-28?focusedCommentId=39596&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-39596)
lists other occasions where the current site sends emails when users
interact with the "employers" part of site.

Do all of these emails need to be implemented for the new site?

## Deliveries to the website

### Right to be forgotten

An internal FRG system handles right-to-be-forgotten requests. The
website will receieve this as a CSV containing the users' email
address and name. These CSVs will be processed by the email once they
are received to delete all record of the user.

Note that this will include the user's profile as stored in the
website, any alerts they have saved, and any files such as CVs that we
might store in the website. However, the website will not attempt to
remove the user from Daxtra or Pardot.

CSVs delivered to the website will be deleted after 7 days.

Questions:

- Currently awaiting confirmation on
  [https://frankgroup.atlassian.net/browse/NW-30](https://frankgroup.atlassian.net/browse/NW-30)
  as to whether above is actually wrong regarding what will be
  delivered to the website.
    - Will we actually be delivered a `.xlsx` file?
        - What sheets and columns?
    - Will we actually be querying a MySQL database?

# Other

## Contact preferences

See
[https://frankgroup.atlassian.net/browse/NW-7](https://frankgroup.atlassian.net/browse/NW-7)
for context. If a user (or rather, in this case, an email address) has
settings about whether or not they should receive job and candidate
alert emails, the website should respect these settings. Based on the
discussion in NW-7, it sounds like, yes, there are settings for that,
they are in Pardot, but the website cannot retrieve them.

How do we proceed?

## Office locations

See [https://frankgroup.atlassian.net/browse/NW-65](https://frankgroup.atlassian.net/browse/NW-65) for context. We can
_probably_ scrape the office addresses from Wordpress as described in
that ticket, and determine the address, phone number, and country.

Questions:

- Is there a better way?
- How do we decide which office to show?
    - To a user in a country with no offices?
    - To a user in a country with multiple offices?

## Wordpress

The existing content (blog posts and content pages) and associated
media files will be retrieved from the existing Wordpress sites. This
will happen on-the-fly, but with caching for performance, and to
reduce load on Wordpress.

This means that the Wordpress sites will need to persist beyond
switchover, and will need to be accessible on a domain other than the
current public domain, that is, `nelsonfrank.com` will be used for the
new site, but there will need to be a domain, with an SSL cert, that
gives access to Wordpress both before and after `nelsonfrank.com` is
switched to the new site.

## Social sign-on configuration

See
[https://frankgroup.atlassian.net/browse/NW-33](https://frankgroup.atlassian.net/browse/NW-33)
for context.

For each of the following, there will be configuration required to
create an "authentication app" in an FRG account for each of
these. From NW-33, this will be separate accounts for each for each
brand.

### Google

Setup instructions to follow

### GitHub

Setup instructions to follow

### LinkedIn

Setup instructions to follow

### Facebook

Setup instructions to follow

### FRG Active Directory

Note: this is the exception as this is not configured within an
account, but by liaising with Acora.

Information regarding the setup instructions for Acora to follow.
