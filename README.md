## Third Annual GitHub Data Challenge
sxywu & azywong

###devs and repos and contributors, oh my!

There are many superstar developers on Github, with watches and stars to the nines.  They manage successful projects, adored (or abhored) by the masses.  But do these superstars ever cross paths?  Do they collaborate with each other?  How do they collaborate?  What's the pattern?
		
In our first attempt at tackling these curiosities, we pull the repos of the developer you've searched for.  Out of their top repos, we get their top contributors.  We then go and pull the repos and top contributors of the developer's top contributors.

Once we have the data, we want to see if there's any patterns.  We approach it in two ways: a timeline and an aggregate network graph.

![timeline](https://raw.githubusercontent.com/sxywu/octokitty/master/app/assets/images/timeline.png)

In the timeline, each column is a developer (represented by a filled label) or a repository (an unfilled label).  A line traces the activity of a developer, as they push commits to their own repositories or contribute to another's.  From there, we can see interesting patterns emerge; in some cases multiple collaborators contribute to the same repo at the same time, and in others, long gaps separate the contributors's commits.  Developers jump back and forth between their repos in the same week, and then jump to their friends'.

![graph](https://raw.githubusercontent.com/sxywu/octokitty/master/app/assets/images/graph.png)

With the graph, we want to understand interconnectivity between the developers.  As we scroll and the weeks pass, who start to collaborate together?  How often do they collaborate together (how much does that line thicken)?  Do contributors to the same repo tend to collaborate more together?
