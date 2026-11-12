// ========================================================
// CAREERPILOT AI - CODE DECODER PRACTICE ENGINE & DATA LAYER
// ========================================================

import { getStudent } from "./auth";

export type CodeLanguage = "python" | "java" | "c";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type PracticeMode = "topic" | "random";

export interface DecoderCategoryStat {
  total: number;
  attempted: number;
  solved: number;
  incorrect: number;
  remaining: number;
  accuracy: number;
  completionRate: number;
}

export interface DecoderTopicStat {
  topic: string;
  language: CodeLanguage;
  difficulty: DifficultyLevel;
  total: number;
  attempted: number;
  solved: number;
  incorrect: number;
  remaining: number;
  accuracy: number;
  completionRate: number;
  status: "Mastered" | "In Progress" | "Not Started";
  sampleQuestionId: string;
}

export interface DecoderOverallStats {
  totalQuestions: number;
  totalAttempted: number;
  totalSolved: number;
  totalIncorrect: number;
  totalRemaining: number;
  overallAccuracy: number;
  completionRate: number;
  byLanguage: Record<CodeLanguage, DecoderCategoryStat>;
  byDifficulty: Record<DifficultyLevel, DecoderCategoryStat>;
  topics: DecoderTopicStat[];
  studentEmail: string;
  studentName?: string;
}

export interface CodeErrorDetail {
  line: number;
  buggySnippet: string;
  fixedSnippet: string;
  reason: string;
}

export interface CodeDecoderQuestion {
  id: string;
  title: string;
  topic: string;
  language: CodeLanguage;
  difficulty: DifficultyLevel;
  description: string;
  expectedBehavior: string;
  sampleInputOutput: string;
  buggyCode: string;
  correctCode: string;
  hint: string;
  explanation: {
    summary: string;
    rootCause: string;
    howToFix: string;
    lineCorrections: CodeErrorDetail[];
    placementTip: string;
  };
  validateCode: (submittedCode: string) => {
    isCorrect: boolean;
    feedback: string;
  };
}

export interface QuestionAttemptRecord {
  questionId: string;
  language: CodeLanguage;
  difficulty: DifficultyLevel;
  lastCode: string;
  isSolved: boolean;
  attemptCount: number;
  revealedAnswer: boolean;
  revealedExplanation: boolean;
  revealedHint: boolean;
  solvedAt?: string;
  lastAttemptAt: string;
}

// --------------------------------------------------------
// CODE DECODER QUESTION BANK
// --------------------------------------------------------
export const decoderQuestions: CodeDecoderQuestion[] = [
  // ==========================================
  // PYTHON - EASY
  // ==========================================
  {
    id: "py-easy-offbyone",
    title: "Sum of Positives (Off-By-One Boundary Error)",
    topic: "Loops & Range Boundaries",
    language: "python",
    difficulty: "Easy",
    description:
      "The function sum_positives(nums) should compute the sum of all strictly positive integers in the list nums. However, the current implementation stops prematurely and never inspects the final element.",
    expectedBehavior:
      "Given nums = [2, -3, 5, 8], sum_positives(nums) should return 15 (2 + 5 + 8). Currently it misses 8 and returns 7.",
    sampleInputOutput: "Input: [4, -1, 6, 2]\nExpected Output: 12\nBuggy Output: 10",
    buggyCode: `def sum_positives(nums):
    total = 0
    # BUG: Loop stops one element short of the end of the list
    for i in range(len(nums) - 1):
        if nums[i] > 0:
            total += nums[i]
    return total`,
    correctCode: `def sum_positives(nums):
    total = 0
    for i in range(len(nums)):
        if nums[i] > 0:
            total += nums[i]
    return total`,
    hint: "Recall how range(n) operates in Python: range(start, stop) stops at stop - 1. If you pass len(nums) - 1, the highest index reached is len(nums) - 2.",
    explanation: {
      summary: "The loop boundary range(len(nums) - 1) truncates iteration before the last index.",
      rootCause:
        "In Python, range(stop) iterates from 0 up to stop - 1. When range(len(nums) - 1) is used, the loop only traverses indices 0 to len(nums) - 2, missing the final element.",
      howToFix:
        "Change range(len(nums) - 1) to range(len(nums)), or better, iterate directly over elements with 'for num in nums:'.",
      lineCorrections: [
        {
          line: 4,
          buggySnippet: "for i in range(len(nums) - 1):",
          fixedSnippet: "for i in range(len(nums)):",
          reason:
            "Allows the index variable i to reach len(nums) - 1, including the last array element.",
        },
      ],
      placementTip:
        "In placement coding assessments, off-by-one loop boundaries are the #1 cause of hidden test case failures. Favor direct iteration 'for x in iterable' whenever index arithmetic isn't strictly required.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("range(len(nums) - 1)")) {
        return {
          isCorrect: false,
          feedback:
            "The range boundary is still 'len(nums) - 1'. The loop must reach the last element.",
        };
      }
      const hasProperRange =
        clean.includes("range(len(nums))") ||
        clean.includes("range(0, len(nums))") ||
        (clean.includes("for") && clean.includes("in nums"));
      if (hasProperRange && clean.includes("total")) {
        return {
          isCorrect: true,
          feedback:
            "Excellent! You corrected the loop bounds. The function now inspects every element in nums.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Check how the list is being traversed. Make sure every item in nums is checked for > 0.",
      };
    },
  },
  {
    id: "py-easy-dictlookup",
    title: "Character Frequency Counter (KeyError Crash)",
    topic: "Hash Maps & Key Initialization",
    language: "python",
    difficulty: "Easy",
    description:
      "The function char_frequencies(text) should count occurrences of all letters. However, incrementing a key that does not yet exist raises an unhandled KeyError on the very first character.",
    expectedBehavior:
      "Given text = 'career', should return {'c': 1, 'a': 1, 'r': 2, 'e': 2}. Currently crashes with KeyError: 'c'.",
    sampleInputOutput:
      "Input: 'hello'\nExpected: {'h': 1, 'e': 1, 'l': 2, 'o': 1}\nBuggy: KeyError",
    buggyCode: `def char_frequencies(text):
    counts = {}
    for ch in text.lower():
        if ch.isalpha():
            # BUG: Raises KeyError when ch is seen for the first time
            counts[ch] += 1
    return counts`,
    correctCode: `def char_frequencies(text):
    counts = {}
    for ch in text.lower():
        if ch.isalpha():
            counts[ch] = counts.get(ch, 0) + 1
    return counts`,
    hint: "Python dicts do not provide default numeric values. Use counts.get(ch, 0) + 1, or check 'if ch not in counts: counts[ch] = 0'.",
    explanation: {
      summary:
        "Directly reading and incrementing an uninitialized dictionary key throws a KeyError in Python.",
      rootCause:
        "The operation counts[ch] += 1 is syntactic sugar for counts[ch] = counts[ch] + 1. The right-hand side attempts to read counts[ch] before it has ever been assigned.",
      howToFix:
        "Initialize the key with counts.get(ch, 0) + 1 or use collections.defaultdict(int).",
      lineCorrections: [
        {
          line: 6,
          buggySnippet: "counts[ch] += 1",
          fixedSnippet: "counts[ch] = counts.get(ch, 0) + 1",
          reason:
            "dict.get(key, 0) safely returns 0 if the key does not exist yet instead of raising an unhandled KeyError.",
        },
      ],
      placementTip:
        "Interviewers frequently test hash table operations. Always demonstrate safe key access using .get(key, default) or membership checking.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("counts[ch] += 1") &&
        !clean.includes("if ch in counts") &&
        !clean.includes("if ch not in counts")
      ) {
        return {
          isCorrect: false,
          feedback:
            "counts[ch] += 1 will still raise a KeyError on the first occurrence of any character.",
        };
      }
      const hasSafeAccess =
        clean.includes("counts.get(ch, 0)") ||
        clean.includes("counts.get(ch,0)") ||
        clean.includes("if ch in counts") ||
        clean.includes("if ch not in counts") ||
        clean.includes("defaultdict");
      if (hasSafeAccess) {
        return {
          isCorrect: true,
          feedback:
            "Great job! Safe dictionary lookup prevents KeyError when registering first-time characters.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Provide default handling for keys that are not yet in the counts dictionary.",
      };
    },
  },

  // ==========================================
  // PYTHON - MEDIUM
  // ==========================================
  {
    id: "py-med-binarysearch",
    title: "Binary Search (Infinite Loop Bug)",
    topic: "Pointers & Binary Search",
    language: "python",
    difficulty: "Medium",
    description:
      "The function binary_search(arr, target) searches a sorted array. However, because the boundary pointer updates assign mid directly without stepping over it, the loop never terminates when target is absent or low == high.",
    expectedBehavior:
      "Given arr = [1, 3, 5, 7, 9] and target = 4, the function should return -1. Currently it freezes in an infinite loop.",
    sampleInputOutput:
      "Input: arr = [2, 4, 6, 8, 10], target = 5\nExpected: -1\nBuggy: Infinite Loop (Timeout)",
    buggyCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # BUG: Not excluding mid causes an infinite loop
            low = mid
        else:
            # BUG: Not excluding mid causes an infinite loop
            high = mid
    return -1`,
    correctCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    hint: "Since arr[mid] is already checked and not equal to target, the target cannot be at mid. Advance low to mid + 1 and decrement high to mid - 1.",
    explanation: {
      summary:
        "Failing to exclude mid from the next search partition causes the search window to never shrink when high - low == 1.",
      rootCause:
        "When low = mid and arr[mid] < target, integer division (low + high) // 2 continues returning the same mid index, freezing low and high permanently.",
      howToFix: "Update the boundaries strictly: low = mid + 1 and high = mid - 1.",
      lineCorrections: [
        {
          line: 10,
          buggySnippet: "low = mid",
          fixedSnippet: "low = mid + 1",
          reason: "Guarantees the search window strictly shrinks towards the right subarray.",
        },
        {
          line: 13,
          buggySnippet: "high = mid",
          fixedSnippet: "high = mid - 1",
          reason: "Guarantees the search window strictly shrinks towards the left subarray.",
        },
      ],
      placementTip:
        "In technical rounds at Amazon, Google, and Microsoft, binary search off-by-one errors are an immediate red flag. Always verify your termination condition and pointer increments.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("low = mid ") || clean.includes("high = mid ")) {
        return {
          isCorrect: false,
          feedback:
            "You are still assigning 'low = mid' or 'high = mid'. This causes an infinite loop when the window size is 2.",
        };
      }
      if (clean.includes("low = mid + 1") && clean.includes("high = mid - 1")) {
        return {
          isCorrect: true,
          feedback:
            "Correct! Advancing low to mid + 1 and shrinking high to mid - 1 guarantees strict reduction and termination.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Make sure both the left and right pointer adjustments exclude the mid index.",
      };
    },
  },
  {
    id: "py-med-mutabledefault",
    title: "Cart Item Appender (Mutable Default Argument Bug)",
    topic: "Default Arguments & Memory Persistence",
    language: "python",
    difficulty: "Medium",
    description:
      "The function add_to_cart(item, cart=[]) adds an item to a user's shopping cart. However, calling the function multiple times without passing an existing cart shares the same list across different shoppers.",
    expectedBehavior:
      "add_to_cart('Apple') -> ['Apple']\nadd_to_cart('Banana') -> ['Banana']\nCurrently it returns ['Apple', 'Banana'] because of a shared mutable list.",
    sampleInputOutput:
      "Call 1: add_to_cart('Book') -> ['Book']\nCall 2: add_to_cart('Pen') -> Expected: ['Pen'] | Buggy: ['Book', 'Pen']",
    buggyCode: `def add_to_cart(item, cart=[]):
    # BUG: The default list is created once at function definition time
    # and shared across every invocation!
    cart.append(item)
    return cart`,
    correctCode: `def add_to_cart(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart`,
    hint: "In Python, default arguments are evaluated only once when the function is defined, not when it is invoked. Use cart=None as the default sentinel.",
    explanation: {
      summary:
        "A mutable default parameter ([]) is created once when Python parses the function object and persists across all calls.",
      rootCause:
        "Python binds default argument expressions when the def statement executes. A single list instance is attached to the function's __defaults__ tuple, causing state leakage.",
      howToFix:
        "Set the default argument to None, and inside the function check if cart is None: cart = [].",
      lineCorrections: [
        {
          line: 1,
          buggySnippet: "def add_to_cart(item, cart=[]):",
          fixedSnippet: "def add_to_cart(item, cart=None):",
          reason: "Uses an immutable sentinel (None) instead of a mutable object.",
        },
        {
          line: 2,
          buggySnippet: "cart.append(item)",
          fixedSnippet: "if cart is None:\n        cart = []\n    cart.append(item)",
          reason: "Creates a fresh new list instance for each independent call.",
        },
      ],
      placementTip:
        "Mutable default arguments in Python are one of the most famous interview questions asked in Python developer screenings at top product firms.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("cart=[]") ||
        (clean.includes("cart = []") && clean.includes("def add_to_cart(item, cart = []):"))
      ) {
        return {
          isCorrect: false,
          feedback: "cart is still using [] as a default parameter in the function signature.",
        };
      }
      if (
        (clean.includes("cart=None") || clean.includes("cart = None")) &&
        (clean.includes("cart is None") || clean.includes("if not cart"))
      ) {
        return {
          isCorrect: true,
          feedback:
            "Well done! Using cart=None and initializing a new list dynamically prevents state leakage across calls.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Use None as default in the signature, and initialize cart = [] when cart is None.",
      };
    },
  },

  // ==========================================
  // PYTHON - HARD
  // ==========================================
  {
    id: "py-hard-twopointer-water",
    title: "Container With Most Water (Inverted Greedy Logic)",
    topic: "Two Pointers & Invariant Proof",
    language: "python",
    difficulty: "Hard",
    description:
      "Given an array heights where each element is a vertical wall height, find the maximum area of water a container can store. The buggy code shifts the taller wall instead of the shorter wall, violating the two-pointer greedy invariant.",
    expectedBehavior:
      "Given heights = [1, 8, 6, 2, 5, 4, 8, 3, 7], the maximum water area is 49. The buggy code prematurely eliminates optimal configurations.",
    sampleInputOutput: "Input: [1, 8, 6, 2, 5, 4, 8, 3, 7]\nExpected Output: 49\nBuggy Output: 24",
    buggyCode: `def max_water_area(heights):
    left = 0
    right = len(heights) - 1
    max_area = 0
    while left < right:
        width = right - left
        h = min(heights[left], heights[right])
        max_area = max(max_area, h * width)
        # BUG: Moving the taller boundary can never increase water height!
        if heights[left] > heights[right]:
            left += 1
        else:
            right -= 1
    return max_area`,
    correctCode: `def max_water_area(heights):
    left = 0
    right = len(heights) - 1
    max_area = 0
    while left < right:
        width = right - left
        h = min(heights[left], heights[right])
        max_area = max(max_area, h * width)
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return max_area`,
    hint: "Water level is bounded by min(heights[left], heights[right]). If you move the taller line, width decreases and height is still limited by the shorter line. You must move the shorter line to seek a taller wall.",
    explanation: {
      summary:
        "The two-pointer technique for Container With Most Water requires advancing the pointer with the smaller height.",
      rootCause:
        "The container area formula is min(h[l], h[r]) * (r - l). The shorter line limits the area. Moving the taller line strictly decreases the width while the height cannot exceed the current shorter wall. Thus, any new area would be smaller.",
      howToFix:
        "Invert the conditional: advance left if heights[left] < heights[right], else decrement right.",
      lineCorrections: [
        {
          line: 10,
          buggySnippet: "if heights[left] > heights[right]:",
          fixedSnippet: "if heights[left] < heights[right]:",
          reason: "Moves the shorter boundary forward in search of a taller candidate.",
        },
      ],
      placementTip:
        "Two-pointer greedy problems require proving which states can safely be pruned. Explain this proof clearly during your interview.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("heights[left] > heights[right]: left += 1") ||
        clean.includes("heights[left] > heights[right]:\n left += 1")
      ) {
        return {
          isCorrect: false,
          feedback:
            "You are still incrementing left when heights[left] > heights[right]. The shorter wall must be advanced.",
        };
      }
      if (
        (clean.includes("heights[left] < heights[right]") && clean.includes("left += 1")) ||
        (clean.includes("heights[left] <= heights[right]") && clean.includes("left += 1"))
      ) {
        return {
          isCorrect: true,
          feedback: "Spot on! Always advance the shorter wall pointer to maximize potential area.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Check the pointer movement logic in the while loop. Compare heights[left] and heights[right].",
      };
    },
  },
  {
    id: "py-hard-lrucache",
    title: "LRU Cache Node Disconnect (Broken Pointers)",
    topic: "Doubly Linked Lists & Memory References",
    language: "python",
    difficulty: "Hard",
    description:
      "In an LRU Cache, the internal helper _remove(node) disconnects an existing node from a doubly linked list. The buggy implementation overwrites node.prev instead of linking node.prev.next, breaking the list continuity.",
    expectedBehavior:
      "When node B is removed from [A <-> B <-> C], A.next must point to C and C.prev must point to A. Currently A.next remains pointing to B, corrupting future lookups.",
    sampleInputOutput:
      "List: Head <-> Node1 <-> Node2 <-> Tail\nAction: _remove(Node1)\nExpected: Head.next == Node2 and Node2.prev == Head\nBuggy: Head.next still points to Node1",
    buggyCode: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        # BUG: Overwrites node.prev instead of connecting node.prev.next!
        node.prev = node.next
        node.next.prev = node.prev`,
    correctCode: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev`,
    hint: "To unlink node from between its neighbors, the predecessor's next pointer must bypass node and point directly to node.next: node.prev.next = node.next.",
    explanation: {
      summary:
        "Assigning node.prev = node.next mutates the node itself rather than splicing its neighboring pointers.",
      rootCause:
        "To excise node from between node.prev and node.next, we must update node.prev.next = node.next and node.next.prev = node.prev.",
      howToFix: "Replace node.prev = node.next with node.prev.next = node.next.",
      lineCorrections: [
        {
          line: 18,
          buggySnippet: "node.prev = node.next",
          fixedSnippet: "node.prev.next = node.next",
          reason: "Re-routes the previous node's forward reference directly to the following node.",
        },
      ],
      placementTip:
        "LRU Cache is among the top 5 most frequently asked system design and coding interview questions worldwide. Memorize the bidirectional splice pattern.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("node.prev = node.next")) {
        return {
          isCorrect: false,
          feedback: "node.prev is still being reassigned. You must update node.prev.next.",
        };
      }
      if (
        clean.includes("node.prev.next = node.next") &&
        clean.includes("node.next.prev = node.prev")
      ) {
        return {
          isCorrect: true,
          feedback:
            "Correct! node.prev.next = node.next cleanly splices the node out of the doubly linked chain.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Ensure both node.prev.next = node.next and node.next.prev = node.prev are present.",
      };
    },
  },

  // ==========================================
  // JAVA - EASY
  // ==========================================
  {
    id: "java-easy-stringequality",
    title: "Password Authenticator (String Comparison using ==)",
    topic: "Reference Identity vs Object Equality",
    language: "java",
    difficulty: "Easy",
    description:
      "The method authenticate(String entered, String stored) checks whether an entered password matches the stored credentials. However, using '==' compares object memory addresses rather than character sequences, causing dynamically allocated strings to fail.",
    expectedBehavior:
      "authenticate(new String('secret123'), 'secret123') should return true. Currently it returns false.",
    sampleInputOutput:
      "Input: entered = new String('admin'), stored = 'admin'\nExpected: true\nBuggy: false",
    buggyCode: `public class Authenticator {
    public static boolean authenticate(String entered, String stored) {
        if (entered == null || stored == null) {
            return false;
        }
        // BUG: == compares heap memory references, not String contents!
        return entered == stored;
    }
}`,
    correctCode: `public class Authenticator {
    public static boolean authenticate(String entered, String stored) {
        if (entered == null || stored == null) {
            return false;
        }
        return entered.equals(stored);
    }
}`,
    hint: "In Java, the '==' operator on objects tests reference identity (do they point to the exact same memory address?). Use .equals() to compare content.",
    explanation: {
      summary:
        "In Java, the '==' operator evaluates reference equality for objects, whereas .equals() evaluates value equality.",
      rootCause:
        "When strings are created dynamically (e.g., from network streams, scanner input, or new String()), they reside in different memory locations even if their characters are identical.",
      howToFix: "Use entered.equals(stored) instead of entered == stored.",
      lineCorrections: [
        {
          line: 7,
          buggySnippet: "return entered == stored;",
          fixedSnippet: "return entered.equals(stored);",
          reason: "Performs deep character-by-character equality comparison.",
        },
      ],
      placementTip:
        "Java String equality (== vs .equals() vs String Pool) is asked in virtually every campus placement technical interview (Infosys, TCS, Wipro, Capgemini).",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("entered == stored") || clean.includes("stored == entered")) {
        return {
          isCorrect: false,
          feedback: "You are still comparing strings with '=='. Use .equals() to check text value.",
        };
      }
      if (clean.includes("entered.equals(stored)") || clean.includes("stored.equals(entered)")) {
        return {
          isCorrect: true,
          feedback:
            "Perfect! entered.equals(stored) compares character values rather than memory addresses.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Use the .equals() method to check if the two strings have identical characters.",
      };
    },
  },
  {
    id: "java-easy-arraybounds",
    title: "Array Maximum Finder (ArrayIndexOutOfBoundsException)",
    topic: "Array Bounds & Off-By-One",
    language: "java",
    difficulty: "Easy",
    description:
      "The method findMax(int[] arr) finds the highest number in a non-empty array. The loop condition uses '<=' instead of '<', causing an ArrayIndexOutOfBoundsException when i reaches arr.length.",
    expectedBehavior:
      "Given arr = [3, 9, 2, 7], findMax(arr) should return 9. Currently crashes with java.lang.ArrayIndexOutOfBoundsException.",
    sampleInputOutput:
      "Input: [12, 45, 19]\nExpected: 45\nBuggy: java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3",
    buggyCode: `public class MaxFinder {
    public static int findMax(int[] arr) {
        int max = arr[0];
        // BUG: <= accesses index equal to arr.length, which is out of bounds!
        for (int i = 1; i <= arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    }
}`,
    correctCode: `public class MaxFinder {
    public static int findMax(int[] arr) {
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    }
}`,
    hint: "Java arrays are 0-indexed. The last valid index of an array of length N is N - 1. A loop condition i <= arr.length attempts to read index N.",
    explanation: {
      summary:
        "The condition i <= arr.length causes the final loop iteration to attempt reading beyond the array bounds.",
      rootCause:
        "In Java, valid array indices are 0 to arr.length - 1. Accessing arr[arr.length] throws ArrayIndexOutOfBoundsException at runtime.",
      howToFix: "Change 'i <= arr.length' to 'i < arr.length'.",
      lineCorrections: [
        {
          line: 5,
          buggySnippet: "for (int i = 1; i <= arr.length; i++)",
          fixedSnippet: "for (int i = 1; i < arr.length; i++)",
          reason: "Restricts iteration to valid indices up to arr.length - 1.",
        },
      ],
      placementTip:
        "Always be vigilant about array termination conditions in competitive programming and technical MCQs.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("i <= arr.length") || clean.includes("i<=arr.length")) {
        return {
          isCorrect: false,
          feedback:
            "The loop condition 'i <= arr.length' still triggers an ArrayIndexOutOfBoundsException.",
        };
      }
      if (clean.includes("i < arr.length") || clean.includes("i<arr.length")) {
        return {
          isCorrect: true,
          feedback:
            "Great work! Changing the boundary to 'i < arr.length' prevents out-of-bounds indexing.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Check the for loop condition. Ensure i strictly stays below arr.length.",
      };
    },
  },

  // ==========================================
  // JAVA - MEDIUM
  // ==========================================
  {
    id: "java-med-nullpointer",
    title: "Linked List Length (NullPointerException on Empty List)",
    topic: "References & Edge Cases",
    language: "java",
    difficulty: "Medium",
    description:
      "The method getLength(ListNode head) calculates the number of nodes in a singly linked list. However, it tests curr.next != null without first verifying if head itself is null, and also fails to count the final node.",
    expectedBehavior:
      "When head is null, should return 0. When list has 3 nodes, should return 3. Currently crashes on empty list and returns 2 for 3 nodes.",
    sampleInputOutput: "Input: null\nExpected: 0\nBuggy: NullPointerException at curr.next",
    buggyCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Solution {
    public static int getLength(ListNode head) {
        int count = 0;
        ListNode curr = head;
        // BUG 1: Crashes with NullPointerException if head is null!
        // BUG 2: Exits while loop when on the last node, missing it in count!
        while (curr.next != null) {
            count++;
            curr = curr.next;
        }
        return count;
    }
}`,
    correctCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Solution {
    public static int getLength(ListNode head) {
        int count = 0;
        ListNode curr = head;
        while (curr != null) {
            count++;
            curr = curr.next;
        }
        return count;
    }
}`,
    hint: "Notice what happens if head == null: dereferencing curr.next immediately throws NullPointerException. Also, if a list has 1 node, curr.next is null, so count never increments! Change while condition to 'curr != null'.",
    explanation: {
      summary:
        "Testing curr.next != null crashes on null heads and undercounts non-empty lists by 1.",
      rootCause:
        "If head is null, curr is null, so curr.next throws NullPointerException. Even for non-null lists, the loop terminates while curr is pointing to the last node, failing to count it.",
      howToFix: "Loop while curr != null instead of curr.next != null.",
      lineCorrections: [
        {
          line: 12,
          buggySnippet: "while (curr.next != null) {",
          fixedSnippet: "while (curr != null) {",
          reason:
            "Safely handles empty list (head == null) and counts every node until reaching null.",
        },
      ],
      placementTip:
        "Standard linked list traversal always loops on 'curr != null'. Only loop on 'curr.next != null' when you need a reference to the preceding node (such as when inserting before tail or finding middle node).",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("while (curr.next != null)") || clean.includes("while(curr.next!=null)")) {
        return {
          isCorrect: false,
          feedback:
            "The loop still checks 'curr.next != null'. If head is null, this throws NullPointerException.",
        };
      }
      if (clean.includes("while (curr != null)") || clean.includes("while(curr!=null)")) {
        return {
          isCorrect: true,
          feedback:
            "Excellent! 'while (curr != null)' handles the empty list gracefully and counts all nodes accurately.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Update the while loop condition to inspect the current node pointer 'curr != null'.",
      };
    },
  },
  {
    id: "java-med-integerdivision",
    title: "Calculate Average Grade (Integer Division Truncation)",
    topic: "Type Casting & Precision Truncation",
    language: "java",
    difficulty: "Medium",
    description:
      "The method calculateAverage(int[] marks) calculates the arithmetic mean of student test scores as a double. Because both sum and marks.length are 32-bit integers, Java performs integer division first, discarding all decimals before assigning to double.",
    expectedBehavior:
      "Given marks = [85, 90, 78, 92], total sum is 345, so average should be 86.25. Currently returns 86.0.",
    sampleInputOutput: "Input: [10, 15]\nExpected: 12.5\nBuggy: 12.0",
    buggyCode: `public class GradeCalculator {
    public static double calculateAverage(int[] marks) {
        if (marks == null || marks.length == 0) return 0.0;
        int sum = 0;
        for (int mark : marks) {
            sum += mark;
        }
        // BUG: Integer division occurs BEFORE assignment to double!
        return sum / marks.length;
    }
}`,
    correctCode: `public class GradeCalculator {
    public static double calculateAverage(int[] marks) {
        if (marks == null || marks.length == 0) return 0.0;
        int sum = 0;
        for (int mark : marks) {
            sum += mark;
        }
        return (double) sum / marks.length;
    }
}`,
    hint: "In Java, an int divided by an int yields an int. To preserve precision, cast either operand to double before division: (double) sum / marks.length.",
    explanation: {
      summary:
        "Integer division in Java truncates fractional parts towards zero prior to implicit widening conversion.",
      rootCause:
        "The expression 'sum / marks.length' divides int by int, producing an integer result (e.g. 345 / 4 = 86). Widening to double afterwards merely converts 86 to 86.0.",
      howToFix: "Cast sum to (double) or declare sum as a double from the start.",
      lineCorrections: [
        {
          line: 9,
          buggySnippet: "return sum / marks.length;",
          fixedSnippet: "return (double) sum / marks.length;",
          reason: "Promotes the arithmetic operation to floating-point division.",
        },
      ],
      placementTip:
        "Arithmetic type promotion rules (JLS 5.6.2) are a classic trap in online aptitude and technical screening assessments.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("return sum / marks.length;") ||
        clean.includes("return sum/marks.length;")
      ) {
        return {
          isCorrect: false,
          feedback:
            "'sum / marks.length' still performs integer division and truncates decimal values.",
        };
      }
      const hasDoubleCast =
        clean.includes("(double) sum") ||
        clean.includes("(double)sum") ||
        clean.includes("sum / (double)") ||
        clean.includes("double sum = 0") ||
        clean.includes("1.0 * sum") ||
        clean.includes("sum * 1.0");
      if (hasDoubleCast) {
        return {
          isCorrect: true,
          feedback:
            "Awesome! Casting to double forces floating-point division and preserves full decimal accuracy.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Ensure at least one operand in the division expression is converted to double.",
      };
    },
  },

  // ==========================================
  // JAVA - HARD
  // ==========================================
  {
    id: "java-hard-concurrentmod",
    title: "Session Manager (ConcurrentModificationException)",
    topic: "Collections & Safe Removal",
    language: "java",
    difficulty: "Hard",
    description:
      "The method removeExpiredSessions(List<Session> sessions) filters expired sessions. Using an enhanced for-loop while modifying the collection directly causes Java's fail-fast iterator to throw ConcurrentModificationException.",
    expectedBehavior:
      "All sessions where isExpired() == true should be safely removed without crashing.",
    sampleInputOutput:
      "Input: List of 4 sessions (2 expired)\nExpected: List with only 2 active sessions remaining\nBuggy: java.util.ConcurrentModificationException",
    buggyCode: `import java.util.List;

public class SessionManager {
    static class Session {
        boolean isExpired() { return true; }
    }

    public static void removeExpiredSessions(List<Session> sessions) {
        // BUG: Calling sessions.remove() inside enhanced for-loop
        // throws ConcurrentModificationException!
        for (Session s : sessions) {
            if (s.isExpired()) {
                sessions.remove(s);
            }
        }
    }
}`,
    correctCode: `import java.util.List;
import java.util.Iterator;

public class SessionManager {
    static class Session {
        boolean isExpired() { return true; }
    }

    public static void removeExpiredSessions(List<Session> sessions) {
        sessions.removeIf(Session::isExpired);
    }
}`,
    hint: "Do not call list.remove() while iterating with a foreach loop. Use sessions.removeIf(Session::isExpired) or use an explicit Iterator with iterator.remove().",
    explanation: {
      summary:
        "Modifying a collection directly while an iterator is traversing it increments modCount, violating the iterator's expected count.",
      rootCause:
        "The enhanced for-loop secretly uses an Iterator. Calling sessions.remove(s) changes the ArrayList size without notifying the iterator, which triggers checkForComodification() -> ConcurrentModificationException.",
      howToFix:
        "Use sessions.removeIf(s -> s.isExpired()) (Java 8+) or explicit Iterator it.remove().",
      lineCorrections: [
        {
          line: 11,
          buggySnippet: "for (Session s : sessions) { if (s.isExpired()) { sessions.remove(s); } }",
          fixedSnippet: "sessions.removeIf(Session::isExpired);",
          reason: "Atomic, fail-safe bulk removal implemented directly within the collection.",
        },
      ],
      placementTip:
        "Collection mutation during iteration is one of the most common production bugs in enterprise Java backends and an interview staple at fintech firms.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("for (Session s : sessions)") && clean.includes("sessions.remove(s)")) {
        return {
          isCorrect: false,
          feedback:
            "Modifying 'sessions' directly inside the enhanced for-loop still triggers ConcurrentModificationException.",
        };
      }
      const hasSafeRemoval =
        clean.includes("removeIf") ||
        clean.includes("iterator.remove()") ||
        clean.includes("it.remove()") ||
        clean.includes("Iterator<Session>");
      if (hasSafeRemoval) {
        return {
          isCorrect: true,
          feedback:
            "Great! Using removeIf() or Iterator.remove() maintains consistency and eliminates ConcurrentModificationException.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Use sessions.removeIf(s -> s.isExpired()) or an Iterator with it.remove().",
      };
    },
  },
  {
    id: "java-hard-bstdelete",
    title: "Binary Search Tree Delete (Lost Subtree Pointer)",
    topic: "Tree Pointers & Two-Child Node Removal",
    language: "java",
    difficulty: "Hard",
    description:
      "In a BST deletion method deleteNode(TreeNode root, int key), when deleting a node with two children, the buggy code finds the minimum value in the right subtree but fails to delete that duplicate successor node from the right child.",
    expectedBehavior:
      "The successor value should replace the current node's value, and the successor must then be recursively removed from root.right.",
    sampleInputOutput:
      "Input: Delete 5 from tree where 5 has two children (successor is 6)\nExpected: 5 replaced by 6, and original 6 removed\nBuggy: Two nodes with value 6 remain in tree",
    buggyCode: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class BSTSolution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) {
            root.left = deleteNode(root.left, key);
        } else if (key > root.val) {
            root.right = deleteNode(root.right, key);
        } else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            
            // BUG: Finds successor but fails to delete the successor node from root.right!
            TreeNode minNode = findMin(root.right);
            root.val = minNode.val;
            // Missing: root.right = deleteNode(root.right, minNode.val);
        }
        return root;
    }
    
    private TreeNode findMin(TreeNode node) {
        while (node.left != null) node = node.left;
        return node;
    }
}`,
    correctCode: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class BSTSolution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) {
            root.left = deleteNode(root.left, key);
        } else if (key > root.val) {
            root.right = deleteNode(root.right, key);
        } else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            
            TreeNode minNode = findMin(root.right);
            root.val = minNode.val;
            root.right = deleteNode(root.right, minNode.val);
        }
        return root;
    }
    
    private TreeNode findMin(TreeNode node) {
        while (node.left != null) node = node.left;
        return node;
    }
}`,
    hint: "After copying minNode.val into root.val, you must delete that successor node from the right subtree: root.right = deleteNode(root.right, minNode.val).",
    explanation: {
      summary:
        "Failing to recursively remove the in-order successor leaves a duplicate node in the BST.",
      rootCause:
        "When a BST node has two children, standard Hibbard deletion copies the successor's value into the target node, then deletes the successor from its original position. Omitting that second step duplicates the successor.",
      howToFix: "Add: root.right = deleteNode(root.right, minNode.val);",
      lineCorrections: [
        {
          line: 21,
          buggySnippet: "root.val = minNode.val;",
          fixedSnippet:
            "root.val = minNode.val;\n            root.right = deleteNode(root.right, minNode.val);",
          reason:
            "Removes the successor node from the right subtree so the BST contains no duplicate values.",
        },
      ],
      placementTip:
        "Binary tree and BST operations (LCA, serialization, deletion) are very popular in FAANG/MANG tier technical interviews.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("deleteNode(root.right, minNode.val)") ||
        clean.includes("deleteNode(root.right, minNode.val);") ||
        clean.includes("root.right = deleteNode(root.right, minNode.val)")
      ) {
        return {
          isCorrect: true,
          feedback:
            "Superb! You correctly invoked deleteNode on root.right to prune the in-order successor.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Remember to prune the successor from the right subtree with: root.right = deleteNode(root.right, minNode.val);",
      };
    },
  },

  // ==========================================
  // C - EASY
  // ==========================================
  {
    id: "c-easy-nullterminator",
    title: "String Copy Buffer (Missing Null Terminator)",
    topic: "Pointers, Strings & Heap Allocation",
    language: "c",
    difficulty: "Easy",
    description:
      "The function duplicate_string(const char* src) clones a string dynamically. The code only allocates strlen(src) bytes without reserving space for '\\0', and also neglects to terminate the destination buffer.",
    expectedBehavior:
      "For src = 'hello' (5 chars), 6 bytes must be allocated and dest[5] = '\\0'. Currently reading the clone leads to garbage memory output or buffer overrun.",
    sampleInputOutput:
      "Input: 'Code'\nExpected Output: 'Code' (clean string)\nBuggy Output: 'Code@#$%' (garbage trailing bytes)",
    buggyCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* duplicate_string(const char* src) {
    if (src == NULL) return NULL;
    // BUG 1: Forgot + 1 for the null terminator '\\0'!
    char* dest = (char*)malloc(strlen(src));
    if (dest == NULL) return NULL;
    
    for (size_t i = 0; i < strlen(src); i++) {
        dest[i] = src[i];
    }
    // BUG 2: Missing dest[i] = '\\0';
    return dest;
}`,
    correctCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* duplicate_string(const char* src) {
    if (src == NULL) return NULL;
    char* dest = (char*)malloc(strlen(src) + 1);
    if (dest == NULL) return NULL;
    
    size_t len = strlen(src);
    for (size_t i = 0; i < len; i++) {
        dest[i] = src[i];
    }
    dest[len] = '\\0';
    return dest;
}`,
    hint: "In C, strings are null-terminated arrays of characters. strlen(s) counts characters excluding the null byte '\\0'. You must allocate strlen(src) + 1 and set dest[len] = '\\0'.",
    explanation: {
      summary:
        "Failing to allocate space for and append the null terminator '\\0' produces an un-terminated string, causing undefined behavior.",
      rootCause:
        "strlen() returns the character count up to but not including '\\0'. Allocating only strlen(src) leaves no room for the sentinel, and C string functions like printf and strlen will continue reading adjacent garbage memory.",
      howToFix: "Allocate malloc(strlen(src) + 1) and assign dest[len] = '\\0'.",
      lineCorrections: [
        {
          line: 8,
          buggySnippet: "char* dest = (char*)malloc(strlen(src));",
          fixedSnippet: "char* dest = (char*)malloc(strlen(src) + 1);",
          reason: "Reserves an extra byte for the null terminator '\\0'.",
        },
        {
          line: 14,
          buggySnippet: "// Missing dest[i] = '\\0';",
          fixedSnippet: "dest[len] = '\\0';",
          reason: "Explicitly caps the string so C string functions know where it ends.",
        },
      ],
      placementTip:
        "Null terminator bugs are the most common source of security vulnerabilities (CVE buffer over-reads) in C/C++ systems engineering.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (
        clean.includes("malloc(strlen(src))") &&
        !clean.includes("strlen(src) + 1") &&
        !clean.includes("strlen(src)+1")
      ) {
        return {
          isCorrect: false,
          feedback: "malloc(strlen(src)) does not leave room for the null byte '\\0'. Add + 1.",
        };
      }
      const hasPlusOne =
        clean.includes("strlen(src) + 1") ||
        clean.includes("strlen(src)+1") ||
        clean.includes("len + 1");
      const hasNullTerminator =
        clean.includes("'\\0'") ||
        clean.includes('"\\0"') ||
        clean.includes("= 0;") ||
        clean.includes("= '\\0';");
      if (hasPlusOne && hasNullTerminator) {
        return {
          isCorrect: true,
          feedback:
            "Correct! Allocating len + 1 and appending '\\0' guarantees a valid, safe C string.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Allocate strlen(src) + 1 and set the final byte to '\\0'.",
      };
    },
  },
  {
    id: "c-easy-scanfampersand",
    title: "Integer Reader (Missing Address-Of Operator & in Scanf)",
    topic: "Pointers & Memory Addresses",
    language: "c",
    difficulty: "Easy",
    description:
      "The function read_student_age() attempts to prompt for and read an integer into age. However, scanf is passed age instead of &age, treating the uninitialized integer value as a memory address and causing a Segmentation Fault.",
    expectedBehavior:
      "scanf should write the parsed integer into the memory address of the variable age.",
    sampleInputOutput: "Input: 21\nExpected: Return 21\nBuggy: Segmentation fault (core dumped)",
    buggyCode: `#include <stdio.h>

int read_student_age() {
    int age = 0;
    printf("Enter age: ");
    // BUG: scanf requires a pointer to the variable, missing '&'!
    scanf("%d", age);
    return age;
}`,
    correctCode: `#include <stdio.h>

int read_student_age() {
    int age = 0;
    printf("Enter age: ");
    scanf("%d", &age);
    return age;
}`,
    hint: "scanf needs to know WHERE to write the input value in memory. Provide the address of the variable using the address-of operator '&age'.",
    explanation: {
      summary:
        'scanf("%d", age) passes the current value of age (0) as the destination pointer, attempting to write into memory address 0x0 (NULL pointer dereference).',
      rootCause:
        "C functions pass arguments by value. To allow scanf to modify age, it must receive the address of age (&age). Passing age directly passes 0, so scanf writes to address 0, causing a fatal SIGSEGV.",
      howToFix: 'Change scanf("%d", age) to scanf("%d", &age).',
      lineCorrections: [
        {
          line: 7,
          buggySnippet: 'scanf("%d", age);',
          fixedSnippet: 'scanf("%d", &age);',
          reason: "Passes the memory address of age so scanf can store the input value.",
        },
      ],
      placementTip:
        "This is an evergreen question in written technical screening tests for service and product companies (TCS NQT, Wipro Elite, Cognizant GenC).",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes('scanf("%d", age)') || clean.includes('scanf("%d",age)')) {
        return {
          isCorrect: false,
          feedback: "scanf(\"%d\", age) is still missing the address-of operator '&'.",
        };
      }
      if (clean.includes('scanf("%d", &age)') || clean.includes('scanf("%d", & age)')) {
        return {
          isCorrect: true,
          feedback: "Spot on! Passing &age provides the address where scanf can write the value.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Ensure you pass &age to scanf.",
      };
    },
  },

  // ==========================================
  // C - MEDIUM
  // ==========================================
  {
    id: "c-med-danglingstack",
    title: "Array Factory (Returning Address of Stack Memory)",
    topic: "Stack vs Heap Lifetime & Dangling Pointers",
    language: "c",
    difficulty: "Medium",
    description:
      "The function create_filled_array(int size, int val) creates an array with each element initialized to val. The buggy code allocates an array on the function stack and returns its pointer. Once the function returns, its stack frame is invalidated, leaving a dangerous dangling pointer.",
    expectedBehavior: "The returned array must remain valid after the function scope exits.",
    sampleInputOutput:
      "Input: size = 5, val = 42\nExpected: Valid array containing [42, 42, 42, 42, 42]\nBuggy: Warning: function returns address of local variable; Segmentation fault or garbage memory",
    buggyCode: `#include <stdio.h>
#include <stdlib.h>

int* create_filled_array(int size, int val) {
    // BUG: Stack memory is deallocated when function returns!
    int arr[size];
    for (int i = 0; i < size; i++) {
        arr[i] = val;
    }
    return arr; // Dangling pointer!
}`,
    correctCode: `#include <stdio.h>
#include <stdlib.h>

int* create_filled_array(int size, int val) {
    int* arr = (int*)malloc(size * sizeof(int));
    if (arr == NULL) return NULL;
    for (int i = 0; i < size; i++) {
        arr[i] = val;
    }
    return arr;
}`,
    hint: "Local array declarations like 'int arr[size];' live in the call stack frame which gets destroyed when the function exits. Allocate memory on the heap with malloc(size * sizeof(int)).",
    explanation: {
      summary:
        "Returning the address of a local automatic stack variable leads to undefined behavior because stack frames are reclaimed upon return.",
      rootCause:
        "Stack variables have automatic storage duration tied to their enclosing block. The moment create_filled_array returns, its stack space can be overwritten by any subsequent function call.",
      howToFix:
        "Use dynamic heap allocation via malloc(size * sizeof(int)) so memory persists until the caller explicitly calls free().",
      lineCorrections: [
        {
          line: 6,
          buggySnippet: "int arr[size];",
          fixedSnippet: "int* arr = (int*)malloc(size * sizeof(int));",
          reason: "Allocates memory on the heap with lifetime lasting until freed.",
        },
      ],
      placementTip:
        "Understanding stack vs heap memory lifetime is tested in core systems rounds at Qualcomm, Cisco, Intel, and embedded software interviews.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("int arr[size];") || clean.includes("int arr[size]")) {
        return {
          isCorrect: false,
          feedback:
            "int arr[size] is still allocated on the stack. Use heap allocation with malloc.",
        };
      }
      if (
        clean.includes("malloc") &&
        (clean.includes("sizeof(int)") || clean.includes("sizeof *arr"))
      ) {
        return {
          isCorrect: true,
          feedback:
            "Excellent! Allocating on the heap with malloc ensures the memory persists after return.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Use malloc(size * sizeof(int)) to allocate persistent heap memory.",
      };
    },
  },
  {
    id: "c-med-bufferoverflow",
    title: "Circular Queue Enqueue (Division vs Modulo Bug)",
    topic: "Operator Confusion & Circular Buffers",
    language: "c",
    difficulty: "Medium",
    description:
      "A circular queue maintains rear pointer wrapping. In the enqueue method, the pointer calculation mistakenly uses division '/' instead of modulo '%', resetting rear to 0 or 1 instead of wrapping around the capacity.",
    expectedBehavior:
      "When rear = 4 and capacity = 5, rear should advance to (4 + 1) % 5 = 0. Currently with '/' it computes (4 + 1) / 5 = 1, violating circular queue semantics.",
    sampleInputOutput: "Queue capacity 5, rear = 4\nExpected: next rear = 0\nBuggy: next rear = 1",
    buggyCode: `typedef struct {
    int data[5];
    int front;
    int rear;
    int size;
    int capacity;
} CircularQueue;

void enqueue(CircularQueue* q, int value) {
    if (q->size == q->capacity) {
        return; // Queue is full
    }
    // BUG: Uses integer division '/' instead of modulo '%'!
    q->rear = (q->rear + 1) / q->capacity;
    q->data[q->rear] = value;
    q->size++;
}`,
    correctCode: `typedef struct {
    int data[5];
    int front;
    int rear;
    int size;
    int capacity;
} CircularQueue;

void enqueue(CircularQueue* q, int value) {
    if (q->size == q->capacity) {
        return; // Queue is full
    }
    q->rear = (q->rear + 1) % q->capacity;
    q->data[q->rear] = value;
    q->size++;
}`,
    hint: "To wrap an index within [0, capacity - 1], use the remainder operator '%' (modulo), not the division operator '/'.",
    explanation: {
      summary:
        "Using division (/) instead of modulo (%) computes the quotient instead of wrapping remainder.",
      rootCause:
        "A circular buffer requires index wrapping: (index + 1) % capacity. Using '/' computes integer quotient, which is 0 for all values below capacity and 1 when index equals capacity.",
      howToFix: "Replace '/ q->capacity' with '% q->capacity'.",
      lineCorrections: [
        {
          line: 14,
          buggySnippet: "q->rear = (q->rear + 1) / q->capacity;",
          fixedSnippet: "q->rear = (q->rear + 1) % q->capacity;",
          reason: "Computes cyclic wrap-around index within the valid array range.",
        },
      ],
      placementTip:
        "Circular buffer algorithms frequently appear in operating systems questions (producer-consumer problem, ring buffers in network device drivers).",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("/ q->capacity") || clean.includes("/q->capacity")) {
        return {
          isCorrect: false,
          feedback: "You are still using division '/'. Use modulo '%' for circular wrap-around.",
        };
      }
      if (clean.includes("% q->capacity") || clean.includes("%q->capacity")) {
        return {
          isCorrect: true,
          feedback:
            "Spot on! Modulo arithmetic properly wraps the index around the circular buffer.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Change the operator from / to % in the pointer advancement.",
      };
    },
  },

  // ==========================================
  // C - HARD
  // ==========================================
  {
    id: "c-hard-reallocleak",
    title: "Dynamic Vector Expand (Memory Leak on Realloc Failure)",
    topic: "Heap Reallocation & Memory Leak Traps",
    language: "c",
    difficulty: "Hard",
    description:
      "When expanding a dynamic array, the function directly assigns ptr = realloc(ptr, new_size). If realloc fails and returns NULL, the original memory block is orphaned and permanently leaked because its pointer was overwritten with NULL.",
    expectedBehavior:
      "If realloc fails, the original memory block must remain accessible and not be leaked.",
    sampleInputOutput:
      "Scenario: System runs low on memory during realloc\nExpected: Original pointer preserved, return error code without memory loss\nBuggy: Original buffer address lost forever (valgrind memory leak)",
    buggyCode: `#include <stdio.h>
#include <stdlib.h>

int* expand_buffer(int* ptr, size_t new_size) {
    // BUG: If realloc fails, it returns NULL and overwrites 'ptr',
    // permanently leaking the original allocated memory block!
    ptr = (int*)realloc(ptr, new_size * sizeof(int));
    if (ptr == NULL) {
        printf("Reallocation failed!\\n");
        return NULL;
    }
    return ptr;
}`,
    correctCode: `#include <stdio.h>
#include <stdlib.h>

int* expand_buffer(int* ptr, size_t new_size) {
    int* temp = (int*)realloc(ptr, new_size * sizeof(int));
    if (temp == NULL) {
        printf("Reallocation failed!\\n");
        // Original ptr is still valid and not leaked
        return NULL;
    }
    return temp;
}`,
    hint: "Never assign the result of realloc directly to the pointer you passed into it. Use an intermediate temporary pointer 'int* temp = realloc(ptr, ...)'. Check if temp != NULL before updating ptr.",
    explanation: {
      summary:
        "Directly assigning realloc output to the source pointer causes an immediate memory leak when realloc returns NULL.",
      rootCause:
        "When realloc cannot find sufficient contiguous memory, it returns NULL but leaves the original memory block untouched. Overwriting ptr = NULL permanently destroys the handle to that existing block.",
      howToFix:
        "Assign the return value of realloc to a temporary pointer (e.g. int* temp). Only update your main pointer if temp is non-NULL.",
      lineCorrections: [
        {
          line: 7,
          buggySnippet: "ptr = (int*)realloc(ptr, new_size * sizeof(int));",
          fixedSnippet: "int* temp = (int*)realloc(ptr, new_size * sizeof(int));",
          reason:
            "Safely holds the new buffer address without overwriting ptr if allocation fails.",
        },
      ],
      placementTip:
        "This is an all-time classic C interview question asked by operating system and compiler teams at Microsoft, NVIDIA, and Apple.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("ptr = (int*)realloc(ptr") || clean.includes("ptr = realloc(ptr")) {
        return {
          isCorrect: false,
          feedback:
            "Directly assigning 'ptr = realloc(ptr, ...)' still leaks memory if realloc returns NULL.",
        };
      }
      const hasTempPointer =
        clean.includes("temp =") ||
        clean.includes("new_ptr =") ||
        clean.includes("tmp =") ||
        clean.includes("result =");
      if (hasTempPointer && clean.includes("realloc")) {
        return {
          isCorrect: true,
          feedback:
            "Bravo! Using a temporary pointer protects the original memory block from being lost.",
        };
      }
      return {
        isCorrect: false,
        feedback:
          "Store the result of realloc in a temporary pointer first to avoid leaking the original memory.",
      };
    },
  },
  {
    id: "c-hard-reversebroken",
    title: "Reverse Singly Linked List (Pointers Overwrite Cycle Trap)",
    topic: "Struct Pointers & In-Place Reversal",
    language: "c",
    difficulty: "Hard",
    description:
      "The function reverse_list(struct Node* head) attempts to reverse a singly linked list in-place. However, it overwrites curr->next before caching the original next node, and then incorrectly advances curr to the newly overwritten curr->next, creating an infinite loop or terminating instantly.",
    expectedBehavior:
      "A list 1 -> 2 -> 3 -> NULL should be cleanly reversed to 3 -> 2 -> 1 -> NULL.",
    sampleInputOutput:
      "Input: 1 -> 2 -> 3 -> NULL\nExpected: 3 -> 2 -> 1 -> NULL\nBuggy: Infinite loop or memory corruption",
    buggyCode: `struct Node {
    int data;
    struct Node* next;
};

struct Node* reverse_list(struct Node* head) {
    struct Node* prev = NULL;
    struct Node* curr = head;
    while (curr != NULL) {
        // BUG: Overwriting curr->next loses the rest of the list!
        curr->next = prev;
        prev = curr;
        curr = curr->next; // BUG: curr->next was just changed to prev!
    }
    return prev;
}`,
    correctCode: `struct Node {
    int data;
    struct Node* next;
};

struct Node* reverse_list(struct Node* head) {
    struct Node* prev = NULL;
    struct Node* curr = head;
    while (curr != NULL) {
        struct Node* next_temp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next_temp;
    }
    return prev;
}`,
    hint: "Before you change curr->next = prev, you must preserve the reference to the upcoming node in a temporary pointer: struct Node* next_temp = curr->next; then advance curr = next_temp.",
    explanation: {
      summary:
        "Failing to cache curr->next before rewiring it severs the rest of the linked list and causes curr to loop backward.",
      rootCause:
        "Assigning curr->next = prev overwrites the forward pointer. Calling curr = curr->next immediately afterward sets curr to prev, immediately breaking forward traversal.",
      howToFix:
        "Introduce a temporary pointer next_temp = curr->next at the start of each iteration, and advance curr to next_temp at the end.",
      lineCorrections: [
        {
          line: 11,
          buggySnippet: "curr->next = prev;",
          fixedSnippet: "struct Node* next_temp = curr->next;\n        curr->next = prev;",
          reason: "Saves reference to remaining list before breaking pointer link.",
        },
        {
          line: 13,
          buggySnippet: "curr = curr->next;",
          fixedSnippet: "curr = next_temp;",
          reason: "Advances curr forward to the saved next node.",
        },
      ],
      placementTip:
        "Reversing a singly linked list in-place using 3 pointers (prev, curr, next) is the classic litmus test for pointer manipulation across tech interviews.",
    },
    validateCode: (code: string) => {
      const clean = code.replace(/\s+/g, " ");
      if (clean.includes("curr = curr->next") && clean.includes("curr->next = prev")) {
        return {
          isCorrect: false,
          feedback:
            "curr = curr->next still reads the modified pointer. Cache the next node before modifying curr->next.",
        };
      }
      const hasTempNext =
        (clean.includes("next_temp") ||
          clean.includes("next_node") ||
          clean.includes("nxt") ||
          clean.includes("nextTemp") ||
          clean.includes("temp")) &&
        clean.includes("curr->next = prev");
      if (hasTempNext) {
        return {
          isCorrect: true,
          feedback:
            "Outstanding! Saving the next pointer in a temporary variable enables clean in-place reversal without losing links.",
        };
      }
      return {
        isCorrect: false,
        feedback: "Save curr->next into a temporary variable before assigning curr->next = prev.",
      };
    },
  },
];

// --------------------------------------------------------
// PROGRESS PERSISTENCE & STATS CALCULATOR
// --------------------------------------------------------
export function getCurrentStudentEmail(): string {
  if (typeof window === "undefined") return "guest@careerpilot.ai";
  try {
    const s = getStudent();
    if (s?.email) return s.email.trim().toLowerCase();
  } catch {
    // fallback
  }
  return "guest@careerpilot.ai";
}

const DECODER_PROGRESS_PREFIX = "cp_code_decoder_progress_";
const LEGACY_DECODER_PROGRESS_KEY = "cp_code_decoder_progress";

export function getDecoderProgress(userEmail?: string): Record<string, QuestionAttemptRecord> {
  if (typeof window === "undefined") return {};
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_PROGRESS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    // Only check legacy key for default session if specific student was not provided
    if (!userEmail) {
      const legacyRaw = localStorage.getItem(LEGACY_DECODER_PROGRESS_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          return parsed;
        } catch {
          return {};
        }
      }
    }
    return {};
  } catch {
    return {};
  }
}

export function saveDecoderProgress(
  questionId: string,
  language: CodeLanguage,
  difficulty: DifficultyLevel,
  code: string,
  isSolved: boolean,
  revealedAnswer: boolean,
  revealedExplanation: boolean,
  revealedHint: boolean,
  userEmail?: string,
) {
  if (typeof window === "undefined" || !questionId) return;
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_PROGRESS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    const all = getDecoderProgress(email);
    const existing = all[questionId];
    const attemptCount = (existing?.attemptCount || 0) + 1;
    const record: QuestionAttemptRecord = {
      questionId,
      language,
      difficulty,
      lastCode: code,
      isSolved: isSolved || !!existing?.isSolved,
      attemptCount,
      revealedAnswer: revealedAnswer || !!existing?.revealedAnswer,
      revealedExplanation: revealedExplanation || !!existing?.revealedExplanation,
      revealedHint: revealedHint || !!existing?.revealedHint,
      solvedAt: isSolved ? existing?.solvedAt || new Date().toISOString() : existing?.solvedAt,
      lastAttemptAt: new Date().toISOString(),
    };
    all[questionId] = record;
    localStorage.setItem(key, JSON.stringify(all));
    // Keep legacy key synchronized only for default student session
    if (!userEmail) {
      localStorage.setItem(LEGACY_DECODER_PROGRESS_KEY, JSON.stringify(all));
    }
  } catch {
    // ignore
  }
}

export function getDecoderStats(userEmail?: string): DecoderOverallStats {
  const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
  const progress = getDecoderProgress(email);
  const totalQuestions = decoderQuestions.length;

  // Distinct questions attempted
  const attemptedIds = Object.keys(progress);
  const totalAttempted = attemptedIds.length;

  // Distinct questions solved correctly
  const solvedRecords = Object.values(progress).filter((p) => p.isSolved);
  const totalSolved = solvedRecords.length;

  // Distinct questions answered incorrectly (attempted but not yet successfully solved)
  const totalIncorrect = Math.max(totalAttempted - totalSolved, 0);

  // Questions remaining to complete
  const totalRemaining = Math.max(totalQuestions - totalSolved, 0);

  // Overall accuracy percentage on attempted questions
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;

  // Overall completion rate percentage
  const completionRate = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  // Breakdown by language (Python, Java, C)
  const byLanguage: Record<CodeLanguage, DecoderCategoryStat> = {
    python: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
    java: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
    c: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
  };

  // Breakdown by difficulty (Easy, Medium, Hard)
  const byDifficulty: Record<DifficultyLevel, DecoderCategoryStat> = {
    Easy: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
    Medium: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
    Hard: {
      total: 0,
      attempted: 0,
      solved: 0,
      incorrect: 0,
      remaining: 0,
      accuracy: 0,
      completionRate: 0,
    },
  };

  // Topic map to aggregate topic-wise performance
  const topicMap = new Map<
    string,
    {
      topic: string;
      language: CodeLanguage;
      difficulty: DifficultyLevel;
      total: number;
      attempted: number;
      solved: number;
      sampleQuestionId: string;
    }
  >();

  for (const q of decoderQuestions) {
    byLanguage[q.language].total++;
    byDifficulty[q.difficulty].total++;

    if (!topicMap.has(q.topic)) {
      topicMap.set(q.topic, {
        topic: q.topic,
        language: q.language,
        difficulty: q.difficulty,
        total: 1,
        attempted: 0,
        solved: 0,
        sampleQuestionId: q.id,
      });
    } else {
      const cur = topicMap.get(q.topic)!;
      cur.total++;
    }

    const userRec = progress[q.id];
    if (userRec) {
      byLanguage[q.language].attempted++;
      byDifficulty[q.difficulty].attempted++;
      const top = topicMap.get(q.topic)!;
      top.attempted++;

      if (userRec.isSolved) {
        byLanguage[q.language].solved++;
        byDifficulty[q.difficulty].solved++;
        top.solved++;
      }
    }
  }

  // Derive remaining, incorrect, accuracy, and completion for each language
  for (const lang of ["python", "java", "c"] as CodeLanguage[]) {
    const l = byLanguage[lang];
    l.incorrect = Math.max(l.attempted - l.solved, 0);
    l.remaining = Math.max(l.total - l.solved, 0);
    l.accuracy = l.attempted > 0 ? Math.round((l.solved / l.attempted) * 100) : 0;
    l.completionRate = l.total > 0 ? Math.round((l.solved / l.total) * 100) : 0;
  }

  // Derive remaining, incorrect, accuracy, and completion for each difficulty
  for (const diff of ["Easy", "Medium", "Hard"] as DifficultyLevel[]) {
    const d = byDifficulty[diff];
    d.incorrect = Math.max(d.attempted - d.solved, 0);
    d.remaining = Math.max(d.total - d.solved, 0);
    d.accuracy = d.attempted > 0 ? Math.round((d.solved / d.attempted) * 100) : 0;
    d.completionRate = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
  }

  // Form topic list with full performance metrics
  const topics: DecoderTopicStat[] = Array.from(topicMap.values()).map((t) => {
    const incorrect = Math.max(t.attempted - t.solved, 0);
    const remaining = Math.max(t.total - t.solved, 0);
    const accuracy = t.attempted > 0 ? Math.round((t.solved / t.attempted) * 100) : 0;
    const completion = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
    const status: "Mastered" | "In Progress" | "Not Started" =
      t.solved >= t.total ? "Mastered" : t.attempted > 0 ? "In Progress" : "Not Started";

    return {
      topic: t.topic,
      language: t.language,
      difficulty: t.difficulty,
      total: t.total,
      attempted: t.attempted,
      solved: t.solved,
      incorrect,
      remaining,
      accuracy,
      completionRate: completion,
      status,
      sampleQuestionId: t.sampleQuestionId,
    };
  });

  let studentName: string | undefined;
  try {
    const s = getStudent();
    if (s?.name) studentName = s.name;
  } catch {
    // ignore
  }

  return {
    totalQuestions,
    totalAttempted,
    totalSolved,
    totalIncorrect,
    totalRemaining,
    overallAccuracy,
    completionRate,
    byLanguage,
    byDifficulty,
    topics,
    studentEmail: email,
    studentName,
  };
}

export function resetDecoderProgress(userEmail?: string) {
  if (typeof window === "undefined") return;
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_PROGRESS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    localStorage.removeItem(key);
    localStorage.removeItem(LEGACY_DECODER_PROGRESS_KEY);
  } catch {
    // ignore
  }
}

// --------------------------------------------------------
// CODE DRAFT PERSISTENCE (PRESERVES STUDENT CODE PER QUESTION)
// --------------------------------------------------------
const DECODER_DRAFTS_PREFIX = "cp_decoder_drafts_";
const LEGACY_DECODER_DRAFTS_KEY = "cp_decoder_drafts";

export function getDecoderDrafts(userEmail?: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_DRAFTS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    const legacyRaw = localStorage.getItem(LEGACY_DECODER_DRAFTS_KEY);
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw);
        localStorage.setItem(key, legacyRaw);
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  } catch {
    return {};
  }
}

export function saveDecoderDraft(questionId: string, code: string, userEmail?: string) {
  if (typeof window === "undefined" || !questionId) return;
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_DRAFTS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    const drafts = getDecoderDrafts(email);
    drafts[questionId] = code;
    localStorage.setItem(key, JSON.stringify(drafts));
    localStorage.setItem(LEGACY_DECODER_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}

export function clearDecoderDraft(questionId: string, userEmail?: string) {
  if (typeof window === "undefined" || !questionId) return;
  try {
    const email = (userEmail || getCurrentStudentEmail()).toLowerCase();
    const key = `${DECODER_DRAFTS_PREFIX}${email.replace(/[^a-z0-9]/g, "_")}`;
    const drafts = getDecoderDrafts(email);
    delete drafts[questionId];
    localStorage.setItem(key, JSON.stringify(drafts));
    localStorage.setItem(LEGACY_DECODER_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}
