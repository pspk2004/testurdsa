import { Question, Difficulty } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: Difficulty.Easy,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
      python: `class Solution(object):\n    def twoSum(self, nums, target):\n        \"\"\"\n        :type nums: List[int]\n        :type target: int\n        :rtype: List[int]\n        \"\"\"\n        `,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`
    },
    examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    testCases: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        { input: "nums = [3,3], target = 6", output: "[0,1]" },
        { input: "nums = [-1,-2,-3,-4,-5], target = -8", output: "[2,4]", hidden: true },
        { input: "nums = [0,4,3,0], target = 0", output: "[0,3]", hidden: true },
    ]
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: Difficulty.Medium,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    starterCode: {
        javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};`,
        python: `class Solution(object):\n    def lengthOfLongestSubstring(self, s):\n        \"\"\"\n        :type s: str\n        :rtype: int\n        \"\"\"\n        `,
        cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};`
    },
    examples: [
        { input: `s = "abcabcbb"`, output: "3", explanation: `The answer is "abc", with the length of 3.`},
        { input: `s = "bbbbb"`, output: "1", explanation: `The answer is "b", with the length of 1.`}
    ],
    testCases: [
        { input: `s = "abcabcbb"`, output: "3" },
        { input: `s = "bbbbb"`, output: "1" },
        { input: `s = "pwwkew"`, output: "3" },
        { input: `s = ""`, output: "0", hidden: true },
        { input: `s = "dvdf"`, output: "3", hidden: true },
    ]
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    difficulty: Difficulty.Hard,
    description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    starterCode: {
        javascript: `/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};`,
        python: `class Solution(object):\n    def findMedianSortedArrays(self, nums1, nums2):\n        \"\"\"\n        :type nums1: List[int]\n        :type nums2: List[int]\n        :rtype: float\n        \"\"\"\n        `,
        cpp: `class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};`
    },
    examples: [
        { input: `nums1 = [1,3], nums2 = [2]`, output: "2.00000"},
        { input: `nums1 = [1,2], nums2 = [3,4]`, output: "2.50000"}
    ],
    testCases: [
        { input: `nums1 = [1,3], nums2 = [2]`, output: "2.00000" },
        { input: `nums1 = [1,2], nums2 = [3,4]`, output: "2.50000" },
        { input: `nums1 = [0,0], nums2 = [0,0]`, output: "0.00000" },
        { input: `nums1 = [], nums2 = [1]`, output: "1.00000", hidden: true },
        { input: `nums1 = [2], nums2 = []`, output: "2.00000", hidden: true },
    ]
  },
];

export const TOTAL_TEST_TIME_SECONDS = 90 * 60; // 90 minutes

export const SCORING = {
    points: {
        [Difficulty.Easy]: 50,
        [Difficulty.Medium]: 100,
        [Difficulty.Hard]: 150,
    },
    violationPenalty: 10,
    maxViolationsPerQuestion: 5,
};