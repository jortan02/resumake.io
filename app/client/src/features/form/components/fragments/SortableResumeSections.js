/**
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc'
import styled from 'styled-components'
import { change } from 'redux-form'
import { colors } from '../../../../common/theme'
import { titleCase } from '../../../../common/utils'
import { 
  toggleWorkItem, 
  toggleEducationItem, 
  toggleSkillItem, 
  toggleProjectItem, 
  toggleAwardItem
} from '../../actions'
import type { FormValues } from '../../types'
import type { State } from '../../../../app/types'
import type { Section } from '../../../../common/types'
import { lighten, darken, rgba } from 'polished'

const Container = styled.div`
  margin: 20px 0;
`

const SectionTitle = styled.h3`
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
  font-size: inherit;
  font-weight: normal;
  color: ${lighten(0.15, colors.foreground)};
`

const List = styled.div`
  min-height: 60px;
`

const ItemContainer = styled.div`
  border: 1px solid ${colors.primary};
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const Handle = styled.span`
  color: ${colors.primary};
  cursor: grab;
  user-select: none;
  margin-right: 12px;
  font-weight: bold;
  
  &:active {
    cursor: grabbing;
  }
`

const ItemContent = styled.div`
  flex: 1;
  font-size: 14px;
`

const ItemTitle = styled.div`
  font-weight: 600;
  color: ${lighten(0.15, colors.foreground)};
  margin-bottom: 4px;
`

const ItemSubtitle = styled.div`
  color: ${colors.foreground};
  font-size: 13px;
`

const CheckboxContainer = styled.div`
  margin-right: 8px;
`

const Checkbox = styled.input`
  margin-right: 8px;
  transform: scale(1.2);
  cursor: pointer;
  
  &:checked {
    accent-color: ${colors.primary};
  }
`

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px solid ${colors.primary};
  padding-top: 12px;
  padding-bottom: 8px;
`

const TailorCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
`

const TailorCheckbox = styled.input`
  margin: 0;
  transform: scale(1.1);
  cursor: pointer;
  
  &:checked {
    accent-color: ${colors.primary};
  }
`

const TailorLabel = styled.label`
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: ${lighten(0.1, colors.foreground)};
  line-height: 1;
`

const DragHandle = SortableHandle(() => {
  return <Handle>::</Handle>
})

// Helper function to get display text for each item type
const getItemDisplayInfo = (item, sectionType) => {
  switch (sectionType) {
    case 'work':
      return {
        title: item.position || '',
        subtitle: item.company ? `at ${item.company}` : ''
      }
    case 'education':
      return {
        title: item.institution || '',
        subtitle: item.studyType && item.area ? `${item.studyType} in ${item.area}` : (item.studyType || item.area || '')
      }
    case 'skills':
      return {
        title: item.name || '',
        subtitle: item.keywords ? item.keywords.filter(k => k).join(', ') : ''
      }
    case 'projects':
      return {
        title: item.name || '',
        subtitle: item.description || ''
      }
    case 'awards':
      return {
        title: item.title || '',
        subtitle: item.awarder && item.date ? `${item.awarder} - ${item.date}` : (item.awarder || item.date || '')
      }
    default:
      return { title: '', subtitle: '' }
  }
}

const SortableItem = SortableElement(({ item, sectionType, itemIndex, onItemToggle }) => {
  const { title, subtitle } = getItemDisplayInfo(item, sectionType)
  
  return (
    <ItemContainer>
      <CheckboxContainer>
        <Checkbox
          type="checkbox"
          checked={item.enabled !== false}
          onChange={() => onItemToggle && onItemToggle(itemIndex)}
        />
      </CheckboxContainer>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {subtitle && <ItemSubtitle>{subtitle}</ItemSubtitle>}
      </ItemContent>
      <DragHandle />
    </ItemContainer>
  )
})

const SortableItemList = SortableContainer(({ items, sectionType, onItemToggle }) => {
  return (
    <List>
      {items.map((item, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          item={item}
          sectionType={sectionType}
          itemIndex={index}
          onItemToggle={onItemToggle}
        />
      ))}
    </List>
  )
})

type Props = {
  sections: Array<Section>,
  work: $PropertyType<FormValues, 'work'>,
  education: $PropertyType<FormValues, 'education'>,
  skills: $PropertyType<FormValues, 'skills'>,
  projects: $PropertyType<FormValues, 'projects'>,
  awards: $PropertyType<FormValues, 'awards'>,
  tailorSections: Object,
  onSortEnd: (sectionType: string, oldIndex: number, newIndex: number) => void,
  dispatch: Function
}

function SortableResumeSections({
  sections,
  work,
  education,
  skills,
  projects,
  awards,
  tailorSections,
  onSortEnd,
  dispatch
}: Props) {
  // Only show sections that have sortable items
  const sortableSections = sections.filter(section => 
    ['work', 'education', 'skills', 'projects', 'awards'].includes(section)
  )

  const getSectionData = (sectionType) => {
    switch (sectionType) {
      case 'work': return work
      case 'education': return education
      case 'skills': return skills
      case 'projects': return projects
      case 'awards': return awards
      default: return []
    }
  }

  const handleSortEnd = (sectionType) => ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      onSortEnd(sectionType, oldIndex, newIndex)
    }
  }

  const handleItemToggle = (sectionType) => (itemIndex) => {
    switch (sectionType) {
      case 'work':
        dispatch(toggleWorkItem(itemIndex))
        break
      case 'education':
        dispatch(toggleEducationItem(itemIndex))
        break
      case 'skills':
        dispatch(toggleSkillItem(itemIndex))
        break
      case 'projects':
        dispatch(toggleProjectItem(itemIndex))
        break
      case 'awards':
        dispatch(toggleAwardItem(itemIndex))
        break
    }
  }

  const handleTailorToggle = (sectionType) => {
    const currentValue = tailorSections[sectionType] || false
    dispatch(change('resume', `tailor.sections.${sectionType}`, !currentValue))
  }

  return (
    <Container>
      {sortableSections.map((sectionType) => {
        const sectionData = getSectionData(sectionType)
        const isTailorEnabled = tailorSections[sectionType] || false

        return (
          <div key={sectionType}>
            <SectionHeader>
              <SectionTitle>{titleCase(sectionType)}</SectionTitle>
              <TailorCheckboxContainer>
                <TailorCheckbox
                  type="checkbox"
                  id={`tailor-${sectionType}`}
                  checked={isTailorEnabled}
                  onChange={() => handleTailorToggle(sectionType)}
                />
                <TailorLabel htmlFor={`tailor-${sectionType}`}>
                  Tailor?
                </TailorLabel>
              </TailorCheckboxContainer>
            </SectionHeader>
            {sectionData && sectionData.length > 0 && (
            <SortableItemList
              items={sectionData}
              sectionType={sectionType}
              onSortEnd={handleSortEnd(sectionType)}
              onItemToggle={handleItemToggle(sectionType)}
              useDragHandle
              lockAxis="y"
              helperClass="sorting-item"
            />
            )}
          </div>
        )
      })}
    </Container>
  )
}

function mapState(state: State) {
  return {
    sections: state.progress.sections,
    work: state.form.resume.values.work,
    education: state.form.resume.values.education,
    skills: state.form.resume.values.skills,
    projects: state.form.resume.values.projects,
    awards: state.form.resume.values.awards,
    tailorSections: state.form.resume.values.tailor.sections
  }
}

export default connect(mapState)(SortableResumeSections)
