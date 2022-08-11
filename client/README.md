<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <img src="client/src/images/loginImg.webp" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">InterPersonal Physiological Waves Synchronization</h3>

</div>

<!-- ABOUT THE PROJECT -->
## About The Project


This project provides a tool through which researchers can visually see the level of synchronization between subjects in different experiments they perform in the laboratory.

<p align="right">(<a href="#top">back to top</a>)</p>


### Built With

* [![React][React.js]][React-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![Mui][Mui.com]][Mui-url]


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started


### Prerequisites

- Google account
- MongoDB
  ```sh
  https://www.mongodb.com/try/download/community
  ```
- nodeJS
  ```sh
  https://nodejs.org/en/download/  
  ```


### Installation

1. Clone the repo
   ```sh
   git clone https://gitlab.com/interpersonalsync/interpersonal-physiological-waves-synchronization.git
   ```
2. From the terminal install NPM packages from the directory of the client and the server
   ```sh
   cd [project_directory_path]/client
   npm install

   cd [project_directory_path]/server
   npm install
   ```
3. Start the project via two options:
    1. From the terminal:
        ```js
          cd [project_directory_path]/server
          npm start

          cd [project_directory_path]/client
          npm start
        ```
    2. Using the script:
        in order to the app get started automatically when the computer startup - do the following steps:
        1. in the server folder under the "scripts" directory - add the path to the project in the relevant places to both "run_app.bat" and "run_app_vbs.vbs" files.
        2. on the file explorer open Startup folder - %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
        or by pressing WINDOWS KEY + R and then copying this text shell:startup
        3. copy the file "run_app_vbs.vbs" to this folder.


4. Enter the application
  ```sh
    https://localhost:8081
  ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

From the homepage of the application the user can reach four pages:

<ol>
  <li>
    <a href="#upload-pages">Upload Pages</a>
    <ul>
      <li><a href="#settings">Settings</a></li>
    </ul>
  </li>
  <li>
    <a href="#my-exeriments"> My Experiments</a>
    <ul>
      <li><a href="#settings">Settings</a></li>
    </ul>
  </li>
  <li>
    <a href="#previous-experiments">Previous Experiments</a>
  </li>
  <li>
    <a href="#my-favorites">My Favorites</a>
  </li>
</ol>


### Upload Pages

In this page there are two options:
1. Upload new experiment
2. Add to existing experiment 

An experiment consists of results from multiple groups of subjects that have been tested.
The user can upload one experiment with multiple groups or rather upload the results of a single group and add it to the related experiment.
The files should have the following format:
For the first option:
- One zip folder.
  - Inside the zip: a folder with the name of the experiment
    - Inside the experiment folder: a folder for each group
      - Inside the group folder: a folder for each subject
        - Inside the subject folder: files for each measure and each part in the experiment

Folders hierarchy for example:
- exp1.zip
  - exp1
    - 1001
      - 101
      - 102
      - 103
    - 1002
      - 201
      - 202
      - 203

For the second option: 
- One zip folder.
  - Inside the zip: a folder with the name of the group
    - Inside the group folder: a folder for each subject
      - Inside the subject folder: files for each measure and each part in the experiment

Folders hierarchy for example: 
- 1001.zip
    - 1001
	    - 101
	    - 102
      - 103


Format of the files for each subject:
- All files should be of type xlsx.
- The names of the files should be in the following format:
  [measure name]_[group name]_[subject name]_[part name].xlsx
  - The measure name should be in capital letters
  - The file name can contain more data but it is important that the first 4 fields that are mentioned will be in the beginning of the name and   any extra detail should be separated by “_”.
  For example: EDA_1001_101_BL_C.xlsx

- Files for HRV:
  - There should be a worksheet named “IBI Series”
  - In this worksheet the relevant data should be in the first column.

- Files for EDA: 
  - There should be a worksheet named “Interval Stats”
  - In this worksheet the relevant data should be in the column named “Mean SC”

* In a group there should be the same amount of files for each subject. 

When uploading large amounts of files it can take some time until all files are processed. After it’s done uploading there will be a message that indicates it went successfully.
Then the user can now choose the settings of the experiment and can also skip this stage and come back to it later. (In the meanwhile there will be set default values for CCF and MDRQA).


### My Experiments

In this page the user will be presented with the experiments he uploaded and the experiments that other researchers shared with him, and from each one he will be able to perform several options.

From the experiments the user uploaded:

Big Experiment: 

1. The user can delete the entire experiment
2. The user can share the experiment with another researchers
3. The user can export CCF report for the entire experiment
4. The user can export MdRQA report for the entire experiment
5. The user can access the settings page of the experiment

The experiment groups:

1. The user can delete the group from the big experiment
2. The user can export CCF report for the chosen group
3. The user can export MdRQA report for the chosen group

From the experiments that were shared with the user:

Big Experiment:

1. The user can remove the experiment from his shared list
2. The user can export CCF report for the entire experiment
3. The user can export MdRQA report for the entire experiment

The experiment groups:

1. The user can export CCF report for the chosen group
2. The user can export MdRQA report for the chosen group


### Previous Experiments

In this page the user can choose an experiment to explore. 
The user first needs to choose the experiment and then choose the group that he wishes to explore.
Now there is an option to upload the video files that were filmed during the experiment.
This section is not mandatory. The user can choose whether to upload videos or not.
The user can upload up to 3 video files for each part (it can be less) and also may upload only for some of the parts and not for all of the parts.
The videos need to be in a format of mp4.
It can be either one or multiple mp4 files, or a zip folder with one or more mp4 files.
For the video to be related to the part it’s supposed to be played in, the name of the video should contain the name of the part the same way the part appears in the excel files.

For example, if the file name was: EDA_1001_101_BL_C.xlsx, then the video name for the part BL should be one of those options:
* BL.mp4
* aaa_BL_aaa.mp4
* aaa_BL.mp4

notice:

- The name can have more data before and after, as long as the part name appears between "_"

- If it appears first, is doesn't need to have " _ " before and if it appears last it doesn't need to have " _ " after

- The "aaa" in the example can be any letter

- There is importance for capital letters/small letter - if in the excel files it was "bl", then also in the video name it should be "bl"

After clicking the "let's go" button, the user is directed to the research page, in which he is presented with different features of the course of the experiment:

- The name of the current part 

- The videos of the course of the experiment (if added)

- The row data (after interpolation if needed)

- The CCF analysis of the subjects of each measures

- Time bar where the user can control the course of the experiment (stop the experiment, resume it, change the speed and jump to a certain time point or to the next/previous part of the experiment)

The user can add a specific time point to his favorites in order to save that time point and be able to jump to that time point later easily, by clicking the star icon on the time bar, adding a description, and clicking on the “ADD” button. 

With the graphs, the user can see the CCF analysis of the subjects on this experiment group, where the lower graphs show the values of the measures of each subject, and the upper graphs show the value of the correlation between the subjects. The user can choose which subjects he is interested in, and select to see only the analysis of them in the graphs by clicking the setting icon in the top of the graph and selecting the interesting couples. The graphs show the analysis dynamically as the time of the experiment passes, so the user can see the development of the interaction between the subjects.


### My Favorites

In this page the user can view all the bookmarks of the experiments he saved when researching the experiment on the research page.
Each bookmark has the following options:
- information about the bookmark:
  - The experiment to which it is belongs
  - The group to which it belongs
  - The part in the experiment to which it is belongs
  - The description of the bookmark
  - The time in the experiment the bookmark was added
- Option to delete the bookmark 
- Option to go directly to the time the bookmark was added
- Option to classify the bookmark in a certain color  

#### settings

The user can change the experiment settings for each experiment both directly after uploading the experiment (from the upload page), and also from the My Experiments page when clicking the menu option and selecting "settings".

- The user can change general settings of the experiment such as the name of the experiment and it’s description. After changing the relevant fildes click the button of "save changes", and the new settings will be saved.

- The user can change the CCF parameters - the parameters that the CCF algorithm will be analyzed with. After changing the relevant fildes click the button of "save changes", and the new settings will be saved.

- The user can change the MdRQA parameters - the parameters that the MdRQA algorithm will be analyzed with. Notice that when changing the parameters of the MdRQA algorithm, all the previous results will be deleted, and will be calculated again with the new parameters. After changing the relevant fildes click the button of "save changes", and the new settings will be saved.



<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Shaked Or, Rony Kattav and Noa Levy

Project Link: [https://github.com/github_username/repo_name](https://github.com/github_username/repo_name)

<p align="right">(<a href="#top">back to top</a>)</p>


[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[Mui.com]: https://img.shields.io/badge/MUI-0769AD?style=for-the-badge&logo=mui&logoColor=white
[Mui-url]: https://mui.com/
