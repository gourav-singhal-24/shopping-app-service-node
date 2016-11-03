## Posts
User can create or like posts. A Post in most simple form has a type, and a text content with optional title.
However a post can be related to additional content such as `File`, `Link`, `Schedule` or `Speciality`
to enrich the content of post. Further more, a post can be linked to `Comment` nodes which enables
User's to comment on a `Post`. Certain types of Posts, such as news can only be created by Admin user.

![Nodes Posts](nodes_posts.puml)

The linked nodes submitted by clients is also verified by server when Post is created.

![Flow Posts](flow_posts.puml)

#### Files
When creating a post, most of the content can be submitted at creation. But in case of `File` attachments however,
[Files Api](../files/files.md) should be used first to obtain `File` node,
which can then be included in submitted data.

#### Link
A `Link` node has url, title and thumbnail url (if any) for a public page on the internet.
The API provides a call to generate from URL of a public resource, a `Link` node,
which can then be included in submitted data.

#### Schedule
It may be desired for a `Post` to have event information, such as start and end date or advanced schedule
info like [iCal](http://tools.ietf.org/html/rfc5545). For that, a `Schedule` node can be generated,
which can then be included in submitted data.

#### Speciality
A `Post` may also optionally link to a `Speciality` node, which can be included in submitted data.
Specialities are available as part of pre-configured data on API.

Typical sequence for creating a post:

![Posts Sequence](seq_posts.puml)

## Comments
User can post a simple text comment on a Post by using the Post id.

![Posts Sequence](seq_comments.puml)

## Like
User can like a post, this simple creates a relation from `User` or `Post`.

![Likes Sequence](seq_likes.puml)

## Events
The following events are generated for `Post` related actions:
1. New Post
2. Liked Post
3. Commented

And appropriate notification should be sent to user's via appropriate medium.