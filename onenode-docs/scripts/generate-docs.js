const fs = require('fs').promises;
const path = require('path');
const JSZip = require('jszip');

// Define the documentation structure
const documentationPages = [
  { path: '/page.tsx', title: 'OneNode Documentation', filename: '01-overview.md' },
  { path: '/overview/page.tsx', title: 'Overview', filename: '02-overview-detailed.md' },
  { path: '/collection/create/page.tsx', title: 'Create Collection', filename: '03-collection-create.md' },
  { path: '/collection/drop/page.tsx', title: 'Drop Collection', filename: '04-collection-drop.md' },
  { path: '/document/find/page.tsx', title: 'Find Documents', filename: '05-document-find.md' },
  { path: '/document/insert/page.tsx', title: 'Insert Documents', filename: '06-document-insert.md' },
  { path: '/document/update/page.tsx', title: 'Update Documents', filename: '07-document-update.md' },
  { path: '/document/delete/page.tsx', title: 'Delete Documents', filename: '08-document-delete.md' },
  { path: '/document/query/page.tsx', title: 'Query Documents', filename: '09-document-query.md' },
  { path: '/syntax/filter/page.tsx', title: 'Filter Syntax', filename: '10-syntax-filter.md' },
  { path: '/syntax/projection/page.tsx', title: 'Projection Syntax', filename: '11-syntax-projection.md' },
  { path: '/syntax/update/page.tsx', title: 'Update Syntax', filename: '12-syntax-update.md' },
  { path: '/llm_models/page.tsx', title: 'LLM Models', filename: '13-llm-models.md' },
  { path: '/llm_models/embedding/page.tsx', title: 'Embedding Models', filename: '14-llm-embedding.md' },
  { path: '/llm_models/vision/page.tsx', title: 'Vision Models', filename: '15-llm-vision.md' },
  { path: '/multimodal/page.tsx', title: 'Multimodal', filename: '16-multimodal.md' },
  { path: '/multimodal/text/page.tsx', title: 'Text Processing', filename: '17-multimodal-text.md' },
  { path: '/multimodal/image/page.tsx', title: 'Image Processing', filename: '18-multimodal-image.md' },
];

// Enhanced function to extract all content from TSX files
function extractContentFromTSX(content, language, title) {
  let markdown = `# ${title}\n\n`;
  
  // Step 1: Extract all const code variables with improved regex
  const codeVars = new Map();
  const constMatches = content.matchAll(/const\s+(\w+)\s*=\s*`([\s\S]*?)`(?=;|\s*const\s|\s*export\s|\s*\/\/|\s*function\s|\s*return\s|\s*}\s*$)/gm);
  for (const match of constMatches) {
    const varName = match[1];
    let code = match[2]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .replace(/\$\{[^}]*\}/g, 'value')
      .trim();
    
    codeVars.set(varName, code);
  }
  
  // Step 2: Process content with improved extraction
  const lines = content.split('\n');
  let isInCorrectLanguageContent = false;
  let isInWrongLanguageContent = false;
  let skipLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle LanguageContent sections
    if (line.includes(`<LanguageContent language="${language}"`)) {
      isInCorrectLanguageContent = true;
      isInWrongLanguageContent = false;
      continue;
    }
    
    if (line.includes('<LanguageContent language=') && !line.includes(`language="${language}"`)) {
      isInCorrectLanguageContent = false;
      isInWrongLanguageContent = true;
      continue;
    }
    
    if (line.includes('</LanguageContent>')) {
      isInCorrectLanguageContent = false;
      isInWrongLanguageContent = false;
      continue;
    }
    
    // Skip content in wrong language sections
    if (isInWrongLanguageContent) {
      continue;
    }
    
    // Extract PageTitle
    if (line.includes('<PageTitle>')) {
      const match = line.match(/<PageTitle>([^<]+)<\/PageTitle>/);
      if (match) {
        markdown += `# ${match[1]}\n\n`;
      }
      continue;
    }
    
    // Extract headings with improved pattern matching
    const headingMatch = line.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/);
    if (headingMatch) {
      const level = parseInt(headingMatch[1]) + 1; // Adjust for markdown
      const text = cleanTextContent(headingMatch[2]);
      if (text) {
        markdown += `${'#'.repeat(level)} ${text}\n\n`;
      }
      continue;
    }
    
    // Extract paragraphs with improved detection
    if (line.includes('<p') && !line.includes('className="text-xs') && !line.includes('className="mb-6')) {
      let paragraphText = '';
      
      // Single line paragraph
      const singleLineMatch = line.match(/<p[^>]*>(.*?)<\/p>/);
      if (singleLineMatch) {
        paragraphText = singleLineMatch[1];
      } else if (line.includes('<p')) {
        // Multi-line paragraph
        let j = i;
        let paragraphContent = '';
        
        // Get opening tag content
        const openingMatch = line.match(/<p[^>]*>(.*)/);
        if (openingMatch) {
          paragraphContent += openingMatch[1];
        }
        
        // Continue until closing tag
        j++;
        while (j < lines.length && !lines[j].includes('</p>')) {
          paragraphContent += ' ' + lines[j].trim();
          j++;
        }
        
        // Get closing tag content
        if (j < lines.length) {
          const closingMatch = lines[j].match(/(.*?)<\/p>/);
          if (closingMatch) {
            paragraphContent += ' ' + closingMatch[1];
          }
          i = j; // Skip processed lines
        }
        
        paragraphText = paragraphContent;
      }
      
      if (paragraphText) {
        const cleanText = cleanTextContent(paragraphText);
        if (cleanText.length > 3) {
          markdown += `${cleanText}\n\n`;
        }
      }
      continue;
    }
    
    // Extract CodeBlock components with improved code variable resolution
    if (line.includes('<CodeBlock')) {
      let codeLanguage = '';
      let code = '';
      
      // Handle multi-line CodeBlock
      let codeBlockContent = line;
      let j = i;
      while (j < lines.length && !lines[j].includes('/>') && !lines[j].includes('</CodeBlock>')) {
        j++;
        if (j < lines.length) {
          codeBlockContent += ' ' + lines[j].trim();
        }
      }
      if (j > i) {
        i = j; // Skip processed lines
      }
      
      // Extract language
      const langMatch = codeBlockContent.match(/language=["']([^"']+)["']/);
      if (langMatch) {
        codeLanguage = langMatch[1];
      }
      
      // Handle contextLanguage dynamic selection
      if (codeBlockContent.includes('contextLanguage')) {
        codeLanguage = language === 'python' ? 'python' : 'typescript';
        
        // Extract dynamic code variable
        const dynamicMatch = codeBlockContent.match(/code=\{contextLanguage === 'python' \? ([^:]+) : ([^}]+)\}/);
        if (dynamicMatch) {
          const pythonVar = dynamicMatch[1].trim();
          const typescriptVar = dynamicMatch[2].trim();
          const selectedVar = language === 'python' ? pythonVar : typescriptVar;
          code = codeVars.get(selectedVar) || '';
        }
      } else {
        // Regular code extraction
        const codeMatch = codeBlockContent.match(/code=\{([^}]+)\}/);
        if (codeMatch) {
          const codeRef = codeMatch[1].trim();
          
          if (codeRef.startsWith('`')) {
            // Inline code - extract template literal
            const fullMatch = codeBlockContent.match(/code=\{`([\s\S]*?)`\}/);
            if (fullMatch) {
              code = fullMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'")
                .replace(/\\\\/g, '\\');
            }
          } else {
            // Variable reference
            code = codeVars.get(codeRef) || '';
          }
        }
      }
      
      // Include code block if it matches our language or is language-neutral
      if (code && codeLanguage) {
        const shouldInclude = 
          !isInWrongLanguageContent && (
            codeLanguage === language ||
            codeLanguage === 'json' ||
            codeLanguage === 'bash' ||
            (language === 'python' && codeLanguage === 'python') ||
            (language === 'typescript' && (codeLanguage === 'typescript' || codeLanguage === 'javascript'))
          );
        
        if (shouldInclude) {
          markdown += `\`\`\`${codeLanguage}\n${code}\n\`\`\`\n\n`;
        }
      }
      continue;
    }
    
    // Extract lists with improved nesting support
    if (line.includes('<ul>') || line.includes('<ol>')) {
      const listType = line.includes('<ul>') ? 'ul' : 'ol';
      let listCounter = 1;
      
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(`</${listType}>`)) {
        if (lines[j].includes('<li>')) {
          let listItem = '';
          
          // Single line list item
          const singleMatch = lines[j].match(/<li[^>]*>(.*?)<\/li>/);
          if (singleMatch) {
            listItem = singleMatch[1];
          } else {
            // Multi-line list item
            let k = j;
            let itemContent = '';
            
            const startMatch = lines[j].match(/<li[^>]*>(.*)/);
            if (startMatch) {
              itemContent += startMatch[1];
            }
            
            k++;
            while (k < lines.length && !lines[k].includes('</li>')) {
              itemContent += ' ' + lines[k].trim();
              k++;
            }
            
            if (k < lines.length) {
              const endMatch = lines[k].match(/(.*?)<\/li>/);
              if (endMatch) {
                itemContent += ' ' + endMatch[1];
              }
            }
            
            listItem = itemContent;
            j = k; // Skip processed lines
          }
          
          const cleanItem = cleanTextContent(listItem);
          if (cleanItem.length > 1) {
            const prefix = listType === 'ul' ? '-' : `${listCounter}.`;
            markdown += `${prefix} ${cleanItem}\n`;
            if (listType === 'ol') listCounter++;
          }
        }
        j++;
      }
      markdown += '\n';
      i = j; // Skip to end of list
      continue;
    }
    
    // Extract InfoCard content
    if (line.includes('<InfoCard')) {
      const titleMatch = line.match(/title=["']([^"']+)["']/);
      if (titleMatch && !titleMatch[1].toLowerCase().includes('feedback')) {
        let infoContent = `## ${titleMatch[1]}\n\n`;
        
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('</InfoCard>')) {
          const infoLine = lines[j];
          
          // Extract paragraphs within InfoCard
          if (infoLine.includes('<p')) {
            const pMatch = infoLine.match(/<p[^>]*>(.*?)<\/p>/);
            if (pMatch) {
              const text = cleanTextContent(pMatch[1]);
              if (text.length > 3) {
                infoContent += `${text}\n\n`;
              }
            }
          }
          
          j++;
        }
        
        markdown += infoContent;
        i = j; // Skip processed lines
      }
      continue;
    }
    
    // Extract table content
    if (line.includes('<table')) {
      let tableContent = '\n';
      let headers = [];
      let rows = [];
      
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('</table>')) {
        const tableLine = lines[j];
        
        // Extract headers
        if (tableLine.includes('<th')) {
          const headerMatch = tableLine.match(/<th[^>]*>(.*?)<\/th>/);
          if (headerMatch) {
            headers.push(cleanTextContent(headerMatch[1]));
          }
        }
        
        // Extract table cells
        if (tableLine.includes('<td')) {
          const cellMatch = tableLine.match(/<td[^>]*>(.*?)<\/td>/);
          if (cellMatch) {
            const cellText = cleanTextContent(cellMatch[1]);
            if (!rows[rows.length] || rows[rows.length - 1].length >= headers.length) {
              rows.push([]);
            }
            rows[rows.length - 1].push(cellText);
          }
        }
        
        j++;
      }
      
      // Generate table markdown
      if (headers.length > 0) {
        tableContent += `| ${headers.join(' | ')} |\n`;
        tableContent += `| ${headers.map(() => '---').join(' | ')} |\n`;
        rows.forEach(row => {
          if (row.length > 0) {
            // Pad row to match header count
            while (row.length < headers.length) {
              row.push('');
            }
            tableContent += `| ${row.slice(0, headers.length).join(' | ')} |\n`;
          }
        });
        tableContent += '\n';
        markdown += tableContent;
      }
      
      i = j; // Skip processed lines
      continue;
    }
    
    // Skip Feedback and ContactUs components
    if (line.includes('<Feedback') || line.includes('<ContactUs')) {
      continue;
    }
    
    // Extract meaningful div content for complex structures
    if (line.includes('<div') && 
        (line.includes('text-center') || line.includes('grid') || line.includes('space-y'))) {
      
      let divContent = extractDivContent(lines, i, isInCorrectLanguageContent);
      if (divContent.content) {
        markdown += divContent.content;
        i = divContent.endIndex;
      }
      continue;
    }
  }
  
  // Helper function to clean text content
  function cleanTextContent(text) {
    if (!text) return '';
    
    return text
      .replace(/<code[^>]*>([^<]+)<\/code>/g, '`$1`')
      .replace(/<strong[^>]*>([^<]+)<\/strong>/g, '**$1**')
      .replace(/<em[^>]*>([^<]+)<\/em>/g, '*$1*')
      .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]+)<\/a>/g, '[$2]($1)')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Helper function to extract div content
  function extractDivContent(lines, startIndex) {
    let content = '';
    let endIndex = startIndex;
    let divLevel = 0;
    
    for (let j = startIndex; j < Math.min(startIndex + 50, lines.length); j++) {
      const line = lines[j];
      
      // Track div nesting
      const openDivs = (line.match(/<div/g) || []).length;
      const closeDivs = (line.match(/<\/div>/g) || []).length;
      divLevel += openDivs - closeDivs;
      
      if (divLevel <= 0 && j > startIndex) {
        endIndex = j;
        break;
      }
      
      // Extract meaningful text content
      const text = cleanTextContent(line);
      if (text.length > 10 && 
          !text.includes('className') && 
          !text.includes('style=') &&
          !line.includes('<div') &&
          !line.includes('</div>')) {
        content += `${text}\n\n`;
      }
      
      // Extract headings within divs
      if (line.includes('<h3>') || line.includes('<h4>')) {
        const match = line.match(/<h[34][^>]*>(.*?)<\/h[34]>/);
        if (match) {
          const headingText = cleanTextContent(match[1]);
          if (headingText) {
            content += `### ${headingText}\n\n`;
          }
        }
      }
    }
    
    return { content: content.trim() ? content : '', endIndex };
  }
  
  return markdown.trim();
}

async function generateDocumentationZip(language) {
  const zip = new JSZip();
  const folderName = `onenode-docs-${language}`;
  
  // Process each documentation page
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  for (const page of documentationPages) {
    try {
      const filePath = path.join(appDir, page.path);
      let fileContent = '';
      
      try {
        fileContent = await fs.readFile(filePath, 'utf8');
      } catch (error) {
        console.warn(`Warning: Could not read ${filePath}`);
        continue;
      }
      
      const extractedContent = extractContentFromTSX(fileContent, language, page.title);
      
      if (extractedContent.trim()) {
        zip.file(`${folderName}/${page.filename}`, extractedContent);
        console.log(`✓ Generated ${page.filename} (${extractedContent.split('\n').length} lines)`);
      } else {
        console.warn(`⚠ Empty content for ${page.filename}`);
      }
    } catch (error) {
      console.error(`Error processing ${page.path}:`, error);
    }
  }
  
  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function main() {
  try {
    console.log('📝 Generating OneNode documentation...');
    
    // Ensure the downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    await fs.mkdir(downloadsDir, { recursive: true });
    
    // Generate documentation for both languages
    const languages = ['python', 'typescript'];
    
    for (const language of languages) {
      console.log(`\n📦 Generating ${language} documentation...`);
      
      const zipBuffer = await generateDocumentationZip(language);
      const fileName = `onenode-docs-${language}-${new Date().toISOString().split('T')[0]}.zip`;
      const filePath = path.join(downloadsDir, fileName);
      
      await fs.writeFile(filePath, zipBuffer);
      console.log(`✅ Generated: ${fileName}`);
    }
    
    console.log('\n🎉 Documentation generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateDocumentationZip, extractContentFromTSX }; 